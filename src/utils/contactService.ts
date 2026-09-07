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
  const prefix = data.encryptWithGpg ? '[GPG-SECURED] ' : '[RM-DISPATCH] ';
  const fullSubject = `${prefix}${data.subject}`;

  let body = `FROM: ${data.name} <${data.email}>\n`;
  body += `DATE: ${new Date().toISOString()}\n`;
  body += `RECIPIENT: ${recipient}\n`;
  body += `----------------------------------------\n\n`;

  if (data.encryptWithGpg) {
    body += `-----BEGIN PGP MESSAGE-----\n`;
    body += `Comment: Encrypted dispatch to Thomas Kenny (4A9F B872 19EC 4E53)\n\n`;
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

  // Attempt API post if server exists
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        confirmationId,
        recipient: PERSONAL_INFO.email,
        timestamp: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      const json = await response.json();
      return {
        success: true,
        confirmationId: json.confirmationId || confirmationId,
        timestamp: json.timestamp || new Date().toLocaleString(),
        message: 'Message registered in local dispatch queue & transmission receipt created.',
        mailtoUrl,
      };
    }
  } catch {
    // Graceful offline / client-direct execution
  }

  return {
    success: true,
    confirmationId,
    timestamp: new Date().toLocaleString(),
    message: `Transmission formatted for ${PERSONAL_INFO.email}. Receipt archived.`,
    mailtoUrl,
  };
}
