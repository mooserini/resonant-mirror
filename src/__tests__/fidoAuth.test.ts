import { 
  generateCryptographicChallenge, 
  isWebAuthnAvailable, 
  performFidoRegistration, 
  performFidoAuthentication 
} from '../utils/fidoAuth';

describe('FIDO2 & WebAuthn Authentication Subsystem', () => {
  test('generateCryptographicChallenge generates a 64-char hex string (32 bytes)', () => {
    const challenge = generateCryptographicChallenge();
    expect(challenge).toBeDefined();
    expect(typeof challenge).toBe('string');
    expect(challenge.length).toBe(64);
    expect(/^[0-9a-f]+$/i.test(challenge)).toBe(true);
  });

  test('performFidoRegistration returns a valid verified FidoSession', async () => {
    const session = await performFidoRegistration('thomas.test');
    expect(session.isAuthenticated).toBe(true);
    expect(session.userHandle).toBe('thomas.test');
    expect(session.credentialId).toBeDefined();
    expect(session.credentialId?.startsWith('RM-')).toBe(true);
    expect(session.algorithm).toContain('ES256');
    expect(session.timestamp).toBeGreaterThan(0);
    expect(session.securityLevel).toContain('FIDO2');
  });

  test('performFidoAuthentication returns an attested assertion session', async () => {
    const authSession = await performFidoAuthentication('thomas.tester');
    expect(authSession.isAuthenticated).toBe(true);
    expect(authSession.userHandle).toBe('thomas.tester');
    expect(authSession.securityLevel).toBeDefined();
    expect(authSession.timestamp).toBeDefined();
  });
});
