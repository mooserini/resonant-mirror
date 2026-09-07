import { validateContactForm, buildMailtoUrl } from '../utils/contactService';
import { ContactFormData } from '../types';

describe('Contact Form & Dispatch Service', () => {
  const validData: ContactFormData = {
    name: 'Ada Lovelace',
    email: 'ada@analyticalengine.org',
    subject: 'Collaboration on Bernoulli numbers',
    message: 'Greetings Thomas, I would like to review the Hermes architecture lineage.',
    encryptWithGpg: false,
  };

  test('validateContactForm passes with valid payload', () => {
    const result = validateContactForm(validData);
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  test('validateContactForm catches missing or short name', () => {
    const result = validateContactForm({ ...validData, name: 'A' });
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  test('validateContactForm catches invalid email format', () => {
    const result = validateContactForm({ ...validData, email: 'not-an-email' });
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  test('validateContactForm catches short message', () => {
    const result = validateContactForm({ ...validData, message: 'hi' });
    expect(result.valid).toBe(false);
    expect(result.errors.message).toBeDefined();
  });

  test('buildMailtoUrl targets mooserini@gmail.com with encoded subject and body', () => {
    const url = buildMailtoUrl(validData);
    expect(url.startsWith('mailto:mooserini@gmail.com')).toBe(true);
    expect(url).toContain('RM-DISPATCH');
    expect(url).toContain(encodeURIComponent('Collaboration on Bernoulli numbers'));
  });

  test('buildMailtoUrl includes PGP block wrapper when encryptWithGpg is true', () => {
    const gpgData: ContactFormData = { ...validData, encryptWithGpg: true };
    const url = buildMailtoUrl(gpgData);
    expect(url).toContain('GPG-SECURED');
    expect(decodeURIComponent(url)).toContain('-----BEGIN PGP MESSAGE-----');
    expect(decodeURIComponent(url)).toContain('-----END PGP MESSAGE-----');
  });
});
