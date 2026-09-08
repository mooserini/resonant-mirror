import React, { useState } from 'react';
import { 
  Send, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  Shield, 
  Terminal,
  RefreshCw
} from 'lucide-react';
import { ContactFormData, ContactReceipt } from '../types';
import { PERSONAL_INFO } from '../data/portfolioData';
import { submitContactMessage, buildMailtoUrl } from '../utils/contactService';
import { retroAudio } from '../utils/audio';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    encryptWithGpg: false,
  });

  const [receipt, setReceipt] = useState<ContactReceipt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    retroAudio.playKeyclick();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await submitContactMessage(formData);
      setReceipt(res);
      retroAudio.playPostBeep(880, 0.15);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Transmission failed. Please verify fields.');
      retroAudio.playPostBeep(440, 0.2);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    retroAudio.playKeyclick();
    const mailto = buildMailtoUrl(formData);
    navigator.clipboard.writeText(
      `TO: ${PERSONAL_INFO.email}\nSUBJECT: ${formData.subject}\n\n${formData.message}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    retroAudio.playKeyclick();
    setReceipt(null);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      encryptWithGpg: false,
    });
  };

  return (
    <section id="contact" className="py-8 sm:py-12">
      <div className="bg-[var(--bg-card)] border-2 border-[var(--border-strong)] shadow-xl relative overflow-hidden">
        
        {/* Top Rainbow Accent */}
        <div className="rainbow-border-top h-[3px] w-full" />

        {/* Section Header */}
        <div className="p-6 sm:p-8 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--rm-accent-bright)] uppercase tracking-wider">
                <Mail className="w-4 h-4" />
                <span>SECTION 04: DIRECT TRANSMISSION TERMINAL</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--text-primary)] mt-1">
                DISPATCH TO THOMAS KENNY
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono mt-1">
                Prepare an email to:{' '}
                <span className="font-bold text-[var(--rm-headings)] underline decoration-dotted">
                  {PERSONAL_INFO.email}
                </span>
              </p>
            </div>

            <div className="text-xs font-mono text-[var(--rm-status)] bg-[var(--bg-primary)] px-3 py-1.5 border border-[var(--border-color)]">
              DISPATCH STATUS: READY
            </div>
          </div>
        </div>

        {/* Form or Receipt View */}
        <div className="p-6 sm:p-8">
          {receipt ? (
            /* Submission Success Terminal Receipt */
            <div className="space-y-5">
              <div className="p-4 sm:p-6 bg-[var(--terminal-bg)] text-[var(--terminal-text)] font-mono text-xs sm:text-sm border-2 border-[var(--rm-status)] shadow-inner space-y-3 leading-relaxed">
                <div className="flex items-center justify-between border-b border-gray-700 pb-2 text-[#88cc88]">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle className="w-4 h-4 text-[var(--rm-status)]" />
                    <span>EMAIL DRAFT PREPARED</span>
                  </div>
                  <span className="text-[11px] text-gray-400">AWAITING SEND</span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div>
                    <span className="text-gray-400">DISPATCH ID:</span>{' '}
                    <span className="font-bold text-white">{receipt.confirmationId}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">TIMESTAMP:</span>{' '}
                    <span>{receipt.timestamp}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">DESTINATION:</span>{' '}
                    <span className="text-[var(--rm-status)] font-bold">{PERSONAL_INFO.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">SENDER:</span>{' '}
                    <span>{formData.name} &lt;{formData.email}&gt;</span>
                  </div>
                  <div>
                    <span className="text-gray-400">STATUS:</span>{' '}
                    <span>{receipt.message}</span>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-2 text-[11px] text-[#a3ffa3]">
                  Your message is ready. Open your email app and send it there, or copy the text below.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <a
                  href={receipt.mailtoUrl}
                  onClick={() => retroAudio.playKeyclick()}
                  className="retro-btn px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer bg-[var(--rm-headings)] text-[var(--rm-heading-text)]"
                  id="contact-open-client-btn"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>[ OPEN IN EMAIL CLIENT (MAILTO) ]</span>
                </a>

                <button
                  onClick={copyToClipboard}
                  className="retro-btn px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
                  id="contact-copy-payload-btn"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? '[ PAYLOAD COPIED! ]' : '[ COPY DISPATCH TEXT ]'}</span>
                </button>

                <button
                  onClick={resetForm}
                  className="retro-btn px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
                  id="contact-reset-btn"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>[ SEND ANOTHER TRANSMISSION ]</span>
                </button>
              </div>
            </div>
          ) : (
            /* Contact Form */
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl font-mono text-xs sm:text-sm">
              {errorMessage && (
                <div className="p-3 bg-red-900/20 border border-red-500 text-red-500 flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="contact-name" className="block text-[var(--text-secondary)] font-bold">
                    YOUR NAME / CALLSIGN: *
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Elena Rostova"
                    className="w-full p-2.5 border-2 border-[var(--border-strong)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--rm-status)]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="contact-email" className="block text-[var(--text-secondary)] font-bold">
                    RETURN EMAIL ADDRESS: *
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. elena@domain.org"
                    className="w-full p-2.5 border-2 border-[var(--border-strong)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--rm-status)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-subject" className="block text-[var(--text-secondary)] font-bold">
                  SUBJECT LINE: *
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Collaboration on Hermes Agent Architecture"
                  className="w-full p-2.5 border-2 border-[var(--border-strong)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--rm-status)]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-message" className="block text-[var(--text-secondary)] font-bold">
                  MESSAGE PAYLOAD: *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Enter your message, inquiry, or architectural proposal..."
                  className="w-full p-2.5 border-2 border-[var(--border-strong)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--rm-status)] resize-y leading-relaxed"
                />
              </div>

              {/* GPG Encrypt Checkbox */}
              <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-start gap-2.5">
                <input
                  id="contact-gpg-checkbox"
                  name="encryptWithGpg"
                  type="checkbox"
                  checked={formData.encryptWithGpg}
                  onChange={handleChange}
                  className="mt-0.5 cursor-pointer accent-[var(--rm-headings)]"
                />
                <label htmlFor="contact-gpg-checkbox" className="text-xs text-[var(--text-secondary)] cursor-pointer select-none">
                  <span className="font-bold text-[var(--text-primary)]">
                    Armored GPG Envelope Simulation:
                  </span>{' '}
                  Wrap this message in ASCII armored PGP markers for Thomas Kenny&apos;s public key (ID: 17B5 86FD 7394 2305).
                </label>
              </div>

              {/* Submit Row */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="contact-submit-btn"
                  className="retro-btn px-6 py-2.5 font-bold flex items-center gap-2 cursor-pointer bg-[var(--rm-headings)] text-[var(--rm-heading-text)] hover:opacity-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? 'PREPARING...' : '[ PREPARE DISPATCH ]'}</span>
                </button>

                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="retro-btn px-4 py-2.5 font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? 'COPIED!' : 'COPY TO CLIPBOARD'}</span>
                </button>

                <span className="text-[11px] text-[var(--text-muted)]">
                  DESTINATION: {PERSONAL_INFO.email}
                </span>
              </div>
            </form>
          )}
        </div>

      </div>
    </section>
  );
};
