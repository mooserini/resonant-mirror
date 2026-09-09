import { authenticateVerifiedPasskey, registerVerifiedPasskey, getCurrentFidoSession } from '../utils/fidoAuth';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
jest.mock('@simplewebauthn/browser', () => ({ startRegistration: jest.fn(), startAuthentication: jest.fn() }));
beforeEach(() => {
  jest.resetAllMocks();
  Object.defineProperty(global, 'window', { configurable: true, value: { PublicKeyCredential: function () {}, dispatchEvent: jest.fn() } });
  Object.defineProperty(global, 'navigator', { configurable: true, value: { credentials: {} } });
  Object.defineProperty(global, 'sessionStorage', { configurable: true, value: { getItem: () => JSON.stringify({ isAuthenticated: true, authenticatorType: 'hardware-sim', userHandle: 'mooserini' }) } });
});
afterEach(() => jest.restoreAllMocks());
test('ignores legacy authenticated flags stored in the browser', () => { expect(getCurrentFidoSession()).toBeNull(); });
for (const [label, operation, mock] of [['registration', () => registerVerifiedPasskey('Visitor'), startRegistration], ['authentication', () => authenticateVerifiedPasskey(), startAuthentication]] as const) {
  test(`${label} cancellation never sends verification or returns success`, async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ options: {} })));
    jest.mocked(mock).mockRejectedValue(new DOMException('cancelled', 'NotAllowedError'));
    await expect(operation()).rejects.toThrow('cancelled');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getCurrentFidoSession()).toBeNull();
  });
  test(`${label} cannot succeed when the server rejects its response`, async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ options: {} }))).mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 }));
    jest.mocked(mock).mockResolvedValue({ id: 'test' } as never);
    await expect(operation()).rejects.toThrow('Invalid signature');
    expect(getCurrentFidoSession()).toBeNull();
  });
}
test('unsupported browsers cannot use simulated passkey success', async () => {
  Object.defineProperty(global, 'window', { configurable: true, value: {} });
  await expect(authenticateVerifiedPasskey()).rejects.toThrow('unavailable');
});
