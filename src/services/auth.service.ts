/**
 * Auth Service
 * Standard /login endpoint with MFA + OTP support.
 *
 * Multi-tenant single-host backend: every pre-bearer endpoint MUST carry
 * `tenant: <slug>` in the body so `ResolveTenantFromBody` can bind the
 * tenant DB before authentication. See backend
 * `.omc/plans/2026-05-03-tenant-aware-auth.md`. Post-bearer requests rely
 * on the JWT → `oauth_token_tenant_index` lookup and don't need it.
 */

import { api } from 'src/boot/axios';
import { useTenant } from 'src/composables/useTenant';
import type {
  LoginCredentials,
  LoginResponse,
  TokenResponse,
  User,
  InviteInfo,
  AcceptInviteRequest,
} from 'src/types';

function tenantBody(): { tenant: string } | Record<string, never> {
  const { slug } = useTenant();
  return slug.value ? { tenant: slug.value } : {};
}

export const authService = {
  /**
   * Login with email/phone and password.
   * Returns tokens OR requires_mfa with mfa_token.
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse | { data: LoginResponse }>('/login', {
      email: credentials.identifier,
      password: credentials.password,
      ...tenantBody(),
    });
    const data = response.data as Record<string, unknown>;
    if ('data' in data && typeof data.data === 'object' && data.data !== null) {
      return data.data as LoginResponse;
    }
    return data as LoginResponse;
  },

  /**
   * Logout - invalidate token. Post-bearer; tenant comes via JWT.
   */
  async logout(): Promise<void> {
    try {
      await api.post('/logout');
    } catch {
      // Ignore logout errors
    }
  },

  /**
   * Get current user profile. Post-bearer.
   */
  async getProfile(): Promise<User> {
    const response = await api.get<{ data: User }>('/profile');
    return response.data.data;
  },

  /**
   * Refresh access token. Refresh-token cookie carries tenant context;
   * tenant body is harmless but unused by the backend here — included
   * for symmetry only when slug is known.
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
      ...tenantBody(),
    });
    return response.data;
  },

  /**
   * Request password reset email. Pre-bearer — tenant required.
   */
  async forgotPassword(email: string): Promise<void> {
    await api.post('/forgot-password', { email, ...tenantBody() });
  },

  /**
   * Reset password with token from email link. Pre-bearer — tenant required.
   */
  async resetPassword(
    token: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<TokenResponse> {
    const response = await api.post<TokenResponse | { data: TokenResponse }>('/reset-password', {
      token,
      email,
      password,
      password_confirmation: passwordConfirmation,
      ...tenantBody(),
    });
    const data = response.data as Record<string, unknown>;
    if ('data' in data && typeof data.data === 'object' && data.data !== null) {
      return data.data as TokenResponse;
    }
    return data as unknown as TokenResponse;
  },

  // ==================== INVITE ====================

  /**
   * Get invite details by token. Pre-bearer — tenant required.
   */
  async getInvite(token: string): Promise<InviteInfo> {
    const response = await api.get<{ data: InviteInfo }>(`/invites/${token}`, {
      params: tenantBody(),
    });
    return response.data.data;
  },

  /**
   * Accept invite and create account. Pre-bearer — tenant required.
   */
  async acceptInvite(token: string, data: AcceptInviteRequest): Promise<boolean> {
    await api.post(`/invites/${token}/accept`, { ...data, ...tenantBody() });
    return true;
  },

  // ==================== OTP LOGIN (PASSWORDLESS) ====================

  /**
   * Check authentication method for identifier. Pre-bearer — tenant required.
   */
  async checkAuthMethod(identifier: string): Promise<CheckAuthMethodResponse> {
    const response = await api.post<CheckAuthMethodResponse>('/auth/check', {
      identifier,
      portal: 'customer',
      ...tenantBody(),
    });
    return response.data;
  },

  /**
   * Request OTP for passwordless login. Pre-bearer — tenant required.
   */
  async requestOtp(identifier: string, channel: 'sms' | 'email'): Promise<OtpRequestResponse> {
    const response = await api.post<OtpRequestResponse>('/auth/otp/request', {
      identifier,
      channel,
      ...tenantBody(),
    });
    return response.data;
  },

  /**
   * Verify OTP and complete login. Pre-bearer — tenant required.
   */
  async verifyOtp(identifier: string, code: string): Promise<OtpVerifyResponse> {
    const response = await api.post<OtpVerifyResponse>('/auth/otp/verify', {
      identifier,
      code,
      ...tenantBody(),
    });
    return response.data;
  },
};

// ==================== OTP Types ====================

export interface OtpChannel {
  channel: 'sms' | 'email';
  label: string;
  masked_destination: string;
  preferred: boolean;
}

export interface CheckAuthMethodResponse {
  method: 'otp' | 'password';
  user_exists: boolean;
  channels?: OtpChannel[];
}

export interface OtpRequestResponse {
  message: string;
  channel: string;
  masked_destination: string;
  expires_in: number;
}

export interface OtpVerifyResponse {
  message: string;
  token_type: string;
  access_token: string;
  refresh_token: string | null;
  expires_in: number;
}
