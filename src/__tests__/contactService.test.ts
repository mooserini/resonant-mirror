import { validateContactForm, buildMailtoUrl, submitContactMessage } from '../utils/contactService';
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

  test('buildMailtoUrl targets tom@getadongle.com with encoded subject and body', () => {
    const url = buildMailtoUrl(validData);
    expect(url.startsWith('mailto:tom@getadongle.com')).toBe(true);
    expect(url).toContain('RM-DISPATCH');
    expect(url).toContain(encodeURIComponent('Collaboration on Bernoulli numbers'));
  });

  test('buildMailtoUrl includes PGP block wrapper when encryptWithGpg is true', () => {
    const gpgData: ContactFormData = { ...validData, encryptWithGpg: true };
    const url = buildMailtoUrl(gpgData);
    expect(url).toContain('GPG-SIMULATION');
    expect(decodeURIComponent(url)).toContain('-----BEGIN PGP MESSAGE-----');
    expect(decodeURIComponent(url)).toContain('-----END PGP MESSAGE-----');
  });
  test('preparing a draft uses the domain address without making a network request', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch');
    try {
      const receipt = await submitContactMessage(validData);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(receipt.mailtoUrl).toMatch(/^mailto:tom@getadongle\.com\?/);
      expect(receipt.message).toContain('Open your email app to send');
      expect(receipt.message).not.toMatch(/sent|delivered|queued/i);
    } finally {
      fetchSpy.mockRestore();
    }
  });

});
