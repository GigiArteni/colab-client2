/**
 * Authentication Types
 * Standard /login + MFA flow (same as colab-ui2)
 */

export interface LoginCredentials {
  identifier: string; // email or phone
  password: string;
}

export interface LoginResponse {
  // Normal login success
  token_type?: string;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  // MFA required
  requires_mfa?: boolean;
  mfa_token?: string;
  mfa_methods?: MfaMethod[];
}

export interface MfaMethod {
  method: 'totp' | 'sms' | 'email';
  label: string;
  icon?: string;
}

export interface MfaChallengeResponse {
  channel: string;
  masked_destination: string;
  expires_in: number;
}

export interface MfaVerifyResponse {
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface TokenResponse {
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  contact?: Contact;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface InviteInfo {
  token: string;
  email: string;
  status: string;
  first_name?: string;
  last_name?: string;
  entity?: {
    id: string;
    name: string;
    logo?: string | null;
  };
}

export interface AcceptInviteRequest {
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
}

// ==================== OTP Login (Passwordless) ====================

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
