/**
 * Auth Service
 * Standard /login endpoint with MFA support (same pattern as colab-ui2)
 */

import { api } from 'src/boot/axios';
import type {
  LoginCredentials,
  LoginResponse,
  TokenResponse,
  User,
} from 'src/types';

export const authService = {
  /**
   * Login with email/phone and password
   * Returns tokens OR requires_mfa with mfa_token
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse | { data: LoginResponse }>('/login', {
      email: credentials.identifier,
      password: credentials.password,
    });
    // Handle both wrapped and unwrapped responses
    const data = response.data as Record<string, unknown>;
    if ('data' in data && typeof data.data === 'object' && data.data !== null) {
      return data.data as LoginResponse;
    }
    return data as LoginResponse;
  },

  /**
   * Logout - invalidate token
   */
  async logout(): Promise<void> {
    try {
      await api.post('/logout');
    } catch {
      // Ignore logout errors
    }
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await api.get<{ data: User }>('/profile');
    return response.data.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  /**
   * Request password reset email
   * Backend builds reset URL from config('app.frontend_url') + /password/reset?token=...&email=...
   */
  async forgotPassword(email: string): Promise<void> {
    await api.post('/forgot-password', { email });
  },

  /**
   * Reset password with token from email link
   * Returns OAuth tokens (logs user in)
   */
  async resetPassword(
    token: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ): Promise<TokenResponse> {
    const response = await api.post<TokenResponse | { data: TokenResponse }>('/reset-password', {
      token,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    // Handle both wrapped and unwrapped responses
    const data = response.data as Record<string, unknown>;
    if ('data' in data && typeof data.data === 'object' && data.data !== null) {
      return data.data as TokenResponse;
    }
    return data as unknown as TokenResponse;
  },

  // ==================== OTP LOGIN (PASSWORDLESS) ====================

  /**
   * Check authentication method for identifier.
   * Returns 'otp' for passwordless or 'password' for traditional login.
   */
  async checkAuthMethod(identifier: string): Promise<CheckAuthMethodResponse> {
    const response = await api.post<CheckAuthMethodResponse>('/auth/check', {
      identifier,
      portal: 'customer', // Customer portal always sends 'customer'
    });
    return response.data;
  },

  /**
   * Request OTP for passwordless login.
   * Sends code via SMS or Email.
   */
  async requestOtp(identifier: string, channel: 'sms' | 'email'): Promise<OtpRequestResponse> {
    const response = await api.post<OtpRequestResponse>('/auth/otp/request', {
      identifier,
      channel,
    });
    return response.data;
  },

  /**
   * Verify OTP and complete login.
   * Returns access tokens on success.
   */
  async verifyOtp(identifier: string, code: string): Promise<OtpVerifyResponse> {
    const response = await api.post<OtpVerifyResponse>('/auth/otp/verify', {
      identifier,
      code,
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
