import { ContactFormData, ContactReceipt } from '../types';
import { PERSONAL_INFO } from '../data/portfolioData';

export function validateContactForm(data: ContactFormData): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Please enter your name or callsign (min 2 chars).';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email.trim())) {
    errors.email = 'Please provide a valid return email address.';
  }

  if (!data.subject || data.subject.trim().length < 3) {
    errors.subject = 'Subject line is required (min 3 chars).';
  }

  if (!data.message || data.message.trim().length < 8) {
    errors.message = 'Message payload must be at least 8 characters.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function buildMailtoUrl(data: ContactFormData): string {
  const recipient = PERSONAL_INFO.email;
  const prefix = data.encryptWithGpg ? '[GPG-SIMULATION] ' : '[RM-DISPATCH] ';
  const fullSubject = `${prefix}${data.subject}`;

  let body = `FROM: ${data.name} <${data.email}>\n`;
  body += `DATE: ${new Date().toISOString()}\n`;
  body += `RECIPIENT: ${recipient}\n`;
  body += `----------------------------------------\n\n`;

  if (data.encryptWithGpg) {
    body += `-----BEGIN PGP MESSAGE-----\n`;
    body += `Comment: Plaintext envelope simulation for Thomas Kenny (4A9F B872 19EC 4E53)\n\n`;
    body += `${data.message}\n\n`;
    body += `-----END PGP MESSAGE-----\n`;
  } else {
    body += `${data.message}\n`;
  }

  return `mailto:${recipient}?subject=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(body)}`;
}

export async function submitContactMessage(data: ContactFormData): Promise<ContactReceipt> {
  const validation = validateContactForm(data);
  if (!validation.valid) {
    const firstError = Object.values(validation.errors)[0];
    throw new Error(firstError);
  }

  const confirmationId = `RM-DISPATCH-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`;
  const mailtoUrl = buildMailtoUrl(data);


  return {
    success: true,
    confirmationId,
    timestamp: new Date().toLocaleString(),
    message: `Draft ready for ${PERSONAL_INFO.email}. Open your email app to send it.`,
    mailtoUrl,
  };
}
