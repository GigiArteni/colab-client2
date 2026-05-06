/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('src/boot/axios', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock('src/composables/useTenant', () => ({
  useTenant: () => ({ slug: { value: 'acme' } }),
}));

vi.mock('quasar', () => ({
  LocalStorage: {
    getItem: vi.fn(() => null),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

import { useAuthStore } from './auth';
import * as authServiceModule from 'src/services/auth.service';
import * as mfaServiceModule from 'src/services/mfa.service';

vi.mock('src/services/auth.service');
vi.mock('src/services/mfa.service');

const mockedAuth = vi.mocked(authServiceModule.authService);
const mockedMfa = vi.mocked(mfaServiceModule.mfaService);

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('starts unauthenticated', () => {
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
  });

  it('login stores token on success', async () => {
    mockedAuth.login.mockResolvedValueOnce({
      access_token: 'tok',
      refresh_token: 'ref',
      requires_mfa: false,
    } as any);

    const store = useAuthStore();
    const result = await store.login({ identifier: 'a@b.c', password: 'pw' });

    expect(result.requiresMfa).toBe(false);
    expect(store.isAuthenticated).toBe(true);
    expect(store.accessToken).toBe('tok');
  });

  it('login sets mfaRequired when MFA needed', async () => {
    mockedAuth.login.mockResolvedValueOnce({
      requires_mfa: true,
      mfa_token: 'mfa-tok',
      mfa_methods: ['totp'],
    } as any);

    const store = useAuthStore();
    const result = await store.login({ identifier: 'a@b.c', password: 'pw' });

    expect(result.requiresMfa).toBe(true);
    expect(store.mfaRequired).toBe(true);
    expect(store.isAuthenticated).toBe(false);
  });

  it('verifyMfaCode completes login after MFA challenge', async () => {
    // First trigger MFA via login
    mockedAuth.login.mockResolvedValueOnce({
      requires_mfa: true,
      mfa_token: 'mfa-tok',
      mfa_methods: ['totp'],
    } as any);
    mockedMfa.verifyCode.mockResolvedValueOnce({
      access_token: 'tok2',
      refresh_token: 'ref2',
    } as any);

    const store = useAuthStore();
    await store.login({ identifier: 'a@b.c', password: 'pw' });
    await store.verifyMfaCode('123456');

    expect(store.accessToken).toBe('tok2');
    expect(store.mfaRequired).toBe(false);
  });

  it('logout clears tokens', async () => {
    mockedAuth.logout.mockResolvedValueOnce(undefined as any);

    const store = useAuthStore();
    store.setTokens('tok', 'ref');
    expect(store.isAuthenticated).toBe(true);

    await store.logout();

    expect(store.isAuthenticated).toBe(false);
    expect(store.accessToken).toBeNull();
  });

  it('checkAuthMethod returns otp and sets otpRequired', async () => {
    mockedAuth.checkAuthMethod.mockResolvedValueOnce({
      method: 'otp',
      user_exists: true,
      channels: ['sms', 'email'],
    } as any);

    const store = useAuthStore();
    const method = await store.checkAuthMethod('a@b.c');

    expect(method).toBe('otp');
    expect(store.otpRequired).toBe(true);
    expect(store.otp.channels).toEqual(['sms', 'email']);
  });

  it('login throws and sets error on failure', async () => {
    mockedAuth.login.mockRejectedValueOnce(new Error('bad credentials'));

    const store = useAuthStore();
    await expect(store.login({ identifier: 'a@b.c', password: 'pw' })).rejects.toThrow('bad credentials');
    expect(store.error).toBe('bad credentials');
    expect(store.isLoading).toBe(false);
  });

  it('checkAuthMethod returns password for non-otp', async () => {
    mockedAuth.checkAuthMethod.mockResolvedValueOnce({
      method: 'password',
      user_exists: true,
      channels: [],
    } as any);

    const store = useAuthStore();
    const method = await store.checkAuthMethod('a@b.c');

    expect(method).toBe('password');
    expect(store.otpRequired).toBe(false);
  });

  it('requestMfaChallenge calls service and sets challenge', async () => {
    mockedAuth.login.mockResolvedValueOnce({
      requires_mfa: true,
      mfa_token: 'mfa-tok',
      mfa_methods: ['totp'],
    } as any);
    mockedMfa.requestChallenge.mockResolvedValueOnce({ expires_at: '2026-05-06T00:00:00Z' } as any);

    const store = useAuthStore();
    await store.login({ identifier: 'a@b.c', password: 'pw' });
    await store.requestMfaChallenge('totp');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockedMfa.requestChallenge).toHaveBeenCalledWith('mfa-tok', 'totp');
    expect(store.mfa.selectedMethod).toBe('totp');
    expect(store.mfa.challenge).toBeTruthy();
  });

  it('cancelMfa resets mfa state and clears error', async () => {
    mockedAuth.login.mockResolvedValueOnce({
      requires_mfa: true,
      mfa_token: 'mfa-tok',
      mfa_methods: ['totp'],
    } as any);

    const store = useAuthStore();
    await store.login({ identifier: 'a@b.c', password: 'pw' });
    store.cancelMfa();

    expect(store.mfaRequired).toBe(false);
    expect(store.mfa.token).toBeNull();
    expect(store.error).toBeNull();
  });

  it('requestOtp sets channel and challenge', async () => {
    mockedAuth.checkAuthMethod.mockResolvedValueOnce({
      method: 'otp',
      user_exists: true,
      channels: ['email'],
    } as any);
    mockedAuth.requestOtp.mockResolvedValueOnce({ expires_in: 300 } as any);

    const store = useAuthStore();
    await store.checkAuthMethod('a@b.c');
    await store.requestOtp('email');

    expect(store.otp.selectedChannel).toBe('email');
    expect(store.otp.challenge).toBeTruthy();
  });

  it('verifyOtp completes login and clears otp state', async () => {
    mockedAuth.checkAuthMethod.mockResolvedValueOnce({
      method: 'otp',
      user_exists: true,
      channels: ['email'],
    } as any);
    mockedAuth.verifyOtp.mockResolvedValueOnce({
      access_token: 'otp-tok',
      refresh_token: 'otp-ref',
    } as any);

    const store = useAuthStore();
    await store.checkAuthMethod('a@b.c');
    await store.verifyOtp('654321');

    expect(store.accessToken).toBe('otp-tok');
    expect(store.otpRequired).toBe(false);
    expect(store.otp.identifier).toBeNull();
  });

  it('cancelOtp resets otp state', async () => {
    mockedAuth.checkAuthMethod.mockResolvedValueOnce({
      method: 'otp',
      user_exists: true,
      channels: ['sms'],
    } as any);

    const store = useAuthStore();
    await store.checkAuthMethod('a@b.c');
    store.cancelOtp();

    expect(store.otpRequired).toBe(false);
    expect(store.otp.identifier).toBeNull();
  });

  it('otpGoBack clears channel selection', async () => {
    mockedAuth.checkAuthMethod.mockResolvedValueOnce({
      method: 'otp',
      user_exists: true,
      channels: ['sms'],
    } as any);
    mockedAuth.requestOtp.mockResolvedValueOnce({ expires_in: 300 } as any);

    const store = useAuthStore();
    await store.checkAuthMethod('a@b.c');
    await store.requestOtp('sms');
    expect(store.otp.selectedChannel).toBe('sms');

    store.otpGoBack();
    expect(store.otp.selectedChannel).toBeNull();
    expect(store.otp.challenge).toBeNull();
  });

  it('logout ignores service errors and still clears tokens', async () => {
    mockedAuth.logout.mockRejectedValueOnce(new Error('server error'));

    const store = useAuthStore();
    store.setTokens('tok', 'ref');
    await store.logout();

    expect(store.accessToken).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it('$reset clears all state', () => {
    const store = useAuthStore();
    store.setTokens('tok', 'ref');
    store.$reset();
    expect(store.accessToken).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });
});
