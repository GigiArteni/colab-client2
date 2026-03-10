/**
 * MFA Service
 * Multi-factor authentication API calls
 */

import { api } from 'src/boot/axios';
import type { MfaChallengeResponse, MfaVerifyResponse } from 'src/types';

export const mfaService = {
  /**
   * Request MFA challenge (send OTP via SMS/Email)
   */
  async requestChallenge(mfaToken: string, method: string): Promise<MfaChallengeResponse> {
    const response = await api.post<MfaChallengeResponse>('/auth/mfa/challenge', {
      mfa_token: mfaToken,
      method: method,
    });
    return response.data;
  },

  /**
   * Verify MFA code and complete login
   */
  async verifyCode(mfaToken: string, code: string, trustDevice = false): Promise<MfaVerifyResponse> {
    const response = await api.post<MfaVerifyResponse>('/auth/mfa/verify', {
      mfa_token: mfaToken,
      code: code,
      trust_device: trustDevice,
    });
    return response.data;
  },
};
