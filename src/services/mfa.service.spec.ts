/**
 * mfa.service — every pre-bearer call carries `tenant: <slug>` in the body.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

const post = vi.fn();
const slugRef = ref<string | null>('acme');

vi.mock('src/boot/axios', () => ({
  api: { post: (url: string, body?: unknown) => post(url, body) },
}));

vi.mock('src/composables/useTenant', () => ({
  useTenant: () => ({ slug: slugRef }),
}));

import { mfaService } from './mfa.service';

describe('mfaService — tenant body field', () => {
  beforeEach(() => {
    post.mockReset();
    post.mockResolvedValue({
      data: {
        channel: 'sms',
        masked_destination: '***',
        expires_in: 60,
        access_token: 't',
        refresh_token: 'r',
        token_type: 'Bearer',
      },
    });
  });

  it('requestChallenge sends tenant', async () => {
    await mfaService.requestChallenge('mfa-token', 'sms');
    expect(post).toHaveBeenCalledWith(
      '/auth/mfa/challenge',
      expect.objectContaining({ tenant: 'acme', mfa_token: 'mfa-token', method: 'sms' }),
    );
  });

  it('verifyCode sends tenant', async () => {
    await mfaService.verifyCode('mfa-token', '123456', true);
    expect(post).toHaveBeenCalledWith(
      '/auth/mfa/verify',
      expect.objectContaining({
        tenant: 'acme',
        mfa_token: 'mfa-token',
        code: '123456',
        trust_device: true,
      }),
    );
  });
});
