/**
 * MFA Service
 * Multi-factor authentication API calls.
 *
 * Both endpoints are pre-bearer (mfa_token is not a Sanctum/Passport bearer),
 * so they require the `tenant: <slug>` body field for the BE
 * `ResolveTenantFromBody` middleware to bind the correct tenant DB.
 */

import { api } from 'src/boot/axios';
import { useTenant } from 'src/composables/useTenant';
import type { MfaChallengeResponse, MfaVerifyResponse } from 'src/types';

function tenantBody(): { tenant: string } | Record<string, never> {
  const { slug } = useTenant();
  return slug.value ? { tenant: slug.value } : {};
}

export const mfaService = {
  /**
   * Request MFA challenge (send OTP via SMS/Email).
   */
  async requestChallenge(mfaToken: string, method: string): Promise<MfaChallengeResponse> {
    const response = await api.post<MfaChallengeResponse>('/auth/mfa/challenge', {
      mfa_token: mfaToken,
      method,
      ...tenantBody(),
    });
    return response.data;
  },

  /**
   * Verify MFA code and complete login.
   */
  async verifyCode(mfaToken: string, code: string, trustDevice = false): Promise<MfaVerifyResponse> {
    const response = await api.post<MfaVerifyResponse>('/auth/mfa/verify', {
      mfa_token: mfaToken,
      code,
      trust_device: trustDevice,
      ...tenantBody(),
    });
    return response.data;
  },
};
