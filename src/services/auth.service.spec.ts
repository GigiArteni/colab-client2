/**
 * auth.service — every pre-bearer call carries `tenant: <slug>` in the body.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

const post = vi.fn();
const get = vi.fn();
const slugRef = ref<string | null>('acme');

vi.mock('src/boot/axios', () => ({
  api: {
    post: (url: string, body?: unknown) => post(url, body),
    get: (url: string) => get(url),
  },
}));

vi.mock('src/composables/useTenant', () => ({
  useTenant: () => ({ slug: slugRef }),
}));

import { authService } from './auth.service';

describe('authService — tenant body field', () => {
  beforeEach(() => {
    post.mockReset();
    get.mockReset();
    post.mockResolvedValue({ data: { access_token: 't', refresh_token: 'r' } });
    get.mockResolvedValue({ data: { data: { id: '1' } } });
    slugRef.value = 'acme';
  });

  it('login sends tenant', async () => {
    await authService.login({ identifier: 'a@b.c', password: 'pw' });
    expect(post).toHaveBeenCalledWith('/login', expect.objectContaining({ tenant: 'acme' }));
  });

  it('checkAuthMethod sends tenant', async () => {
    post.mockResolvedValueOnce({ data: { method: 'password', user_exists: true } });
    await authService.checkAuthMethod('a@b.c');
    expect(post).toHaveBeenCalledWith('/auth/check', expect.objectContaining({ tenant: 'acme' }));
  });

  it('requestOtp sends tenant', async () => {
    post.mockResolvedValueOnce({
      data: { message: 'ok', channel: 'sms', masked_destination: '***', expires_in: 60 },
    });
    await authService.requestOtp('a@b.c', 'sms');
    expect(post).toHaveBeenCalledWith('/auth/otp/request', expect.objectContaining({ tenant: 'acme' }));
  });

  it('verifyOtp sends tenant', async () => {
    post.mockResolvedValueOnce({
      data: {
        message: 'ok',
        token_type: 'Bearer',
        access_token: 't',
        refresh_token: null,
        expires_in: 3600,
      },
    });
    await authService.verifyOtp('a@b.c', '123456');
    expect(post).toHaveBeenCalledWith('/auth/otp/verify', expect.objectContaining({ tenant: 'acme' }));
  });

  it('forgotPassword sends tenant', async () => {
    await authService.forgotPassword('a@b.c');
    expect(post).toHaveBeenCalledWith('/forgot-password', expect.objectContaining({ tenant: 'acme' }));
  });

  it('resetPassword sends tenant', async () => {
    await authService.resetPassword('tok', 'a@b.c', 'pw', 'pw');
    expect(post).toHaveBeenCalledWith('/reset-password', expect.objectContaining({ tenant: 'acme' }));
  });

  it('logout does not require tenant body (post-bearer)', async () => {
    await authService.logout();
    expect(post).toHaveBeenCalledWith('/logout', undefined);
  });
});

describe('authService — without tenant slug', () => {
  beforeEach(() => {
    post.mockReset();
    post.mockResolvedValue({ data: {} });
    slugRef.value = null;
  });

  it('omits tenant key when slug is null', async () => {
    await authService.login({ identifier: 'a@b.c', password: 'pw' });
    const [, body] = post.mock.calls[0]!;
    expect(body).not.toHaveProperty('tenant');
  });
});
