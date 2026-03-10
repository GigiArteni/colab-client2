/**
 * Auth Store
 * Handles authentication with MFA support (same pattern as colab-ui2)
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { LocalStorage } from 'quasar';
import { authService } from 'src/services/auth.service';
import { mfaService } from 'src/services/mfa.service';
import type {
  LoginCredentials,
  MfaMethod,
  MfaChallengeResponse,
  OtpChannel,
  OtpRequestResponse,
} from 'src/types';

export const useAuthStore = defineStore('auth', () => {
  // State
  const accessToken = ref<string | null>(LocalStorage.getItem('access_token'));
  const refreshToken = ref<string | null>(LocalStorage.getItem('refresh_token'));
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // MFA State
  const mfaRequired = ref(false);
  const mfaToken = ref<string | null>(null);
  const mfaMethods = ref<MfaMethod[]>([]);
  const mfaSelectedMethod = ref<string | null>(null);
  const mfaChallenge = ref<MfaChallengeResponse | null>(null);

  // OTP Login State (Passwordless)
  const otpRequired = ref(false);
  const otpIdentifier = ref<string | null>(null);
  const otpChannels = ref<OtpChannel[]>([]);
  const otpSelectedChannel = ref<'sms' | 'email' | null>(null);
  const otpChallenge = ref<OtpRequestResponse | null>(null);

  // Computed
  const isAuthenticated = computed(() => !!accessToken.value);

  // MFA computed (for template access)
  const mfa = computed(() => ({
    required: mfaRequired.value,
    token: mfaToken.value,
    methods: mfaMethods.value,
    selectedMethod: mfaSelectedMethod.value,
    challenge: mfaChallenge.value,
  }));

  // OTP computed (for template access)
  const otp = computed(() => ({
    required: otpRequired.value,
    identifier: otpIdentifier.value,
    channels: otpChannels.value,
    selectedChannel: otpSelectedChannel.value,
    challenge: otpChallenge.value,
  }));

  /**
   * Login with credentials
   * Returns { requiresMfa: boolean }
   */
  async function login(credentials: LoginCredentials): Promise<{ requiresMfa: boolean }> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authService.login(credentials);

      if (response.requires_mfa) {
        // MFA required
        mfaRequired.value = true;
        mfaToken.value = response.mfa_token || null;
        mfaMethods.value = response.mfa_methods || [];
        return { requiresMfa: true };
      }

      // No MFA - store tokens
      if (response.access_token) {
        setTokens(response.access_token, response.refresh_token || null);
        console.log('[AuthStore] Login successful, token stored');
      } else {
        console.warn('[AuthStore] Login response missing access_token:', response);
      }

      return { requiresMfa: false };
    } catch (err) {
      error.value = getErrorMessage(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Request MFA challenge (send OTP)
   */
  async function requestMfaChallenge(method: string): Promise<void> {
    if (!mfaToken.value) {
      throw new Error('No MFA token available');
    }

    isLoading.value = true;
    error.value = null;

    try {
      const challenge = await mfaService.requestChallenge(mfaToken.value, method);
      mfaSelectedMethod.value = method;
      mfaChallenge.value = challenge;
    } catch (err) {
      error.value = getErrorMessage(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Verify MFA code and complete login
   */
  async function verifyMfaCode(code: string, trustDevice = false): Promise<void> {
    if (!mfaToken.value) {
      throw new Error('No MFA token available');
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await mfaService.verifyCode(mfaToken.value, code, trustDevice);
      setTokens(response.access_token, response.refresh_token);
      resetMfaState();
    } catch (err) {
      error.value = getErrorMessage(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Cancel MFA - go back to login
   */
  function cancelMfa(): void {
    resetMfaState();
    error.value = null;
  }

  // ==================== OTP LOGIN (PASSWORDLESS) ====================

  /**
   * Check authentication method for identifier
   * Returns 'otp' for passwordless or 'password' for traditional login
   */
  async function checkAuthMethod(identifier: string): Promise<'otp' | 'password'> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authService.checkAuthMethod(identifier);

      if (response.method === 'otp') {
        // Set OTP state
        otpRequired.value = true;
        otpIdentifier.value = identifier;
        otpChannels.value = response.channels || [];
        return 'otp';
      }

      return 'password';
    } catch (err) {
      error.value = getErrorMessage(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Request OTP code (send SMS or Email)
   */
  async function requestOtp(channel: 'sms' | 'email'): Promise<void> {
    if (!otpIdentifier.value) {
      throw new Error('No identifier available');
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await authService.requestOtp(otpIdentifier.value, channel);
      otpSelectedChannel.value = channel;
      otpChallenge.value = response;
    } catch (err) {
      error.value = getErrorMessage(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Verify OTP code and complete login
   */
  async function verifyOtp(code: string): Promise<void> {
    if (!otpIdentifier.value) {
      throw new Error('No identifier available');
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await authService.verifyOtp(otpIdentifier.value, code);
      setTokens(response.access_token, response.refresh_token);
      resetOtpState();
    } catch (err) {
      error.value = getErrorMessage(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Cancel OTP - go back to identifier input
   */
  function cancelOtp(): void {
    resetOtpState();
    error.value = null;
  }

  /**
   * Go back to channel selection (from code input)
   */
  function otpGoBack(): void {
    otpSelectedChannel.value = null;
    otpChallenge.value = null;
    error.value = null;
  }

  /**
   * Reset OTP state
   */
  function resetOtpState(): void {
    otpRequired.value = false;
    otpIdentifier.value = null;
    otpChannels.value = [];
    otpSelectedChannel.value = null;
    otpChallenge.value = null;
  }

  /**
   * Logout - clear all state
   */
  async function logout(): Promise<void> {
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors
    } finally {
      clearTokens();
      resetMfaState();
      resetOtpState();
    }
  }

  /**
   * Set tokens in state and storage
   */
  function setTokens(access: string, refresh: string | null): void {
    accessToken.value = access;
    refreshToken.value = refresh;
    LocalStorage.set('access_token', access);
    if (refresh) {
      LocalStorage.set('refresh_token', refresh);
    }
  }

  /**
   * Clear tokens from state and storage
   */
  function clearTokens(): void {
    accessToken.value = null;
    refreshToken.value = null;
    LocalStorage.remove('access_token');
    LocalStorage.remove('refresh_token');
  }

  /**
   * Reset MFA state
   */
  function resetMfaState(): void {
    mfaRequired.value = false;
    mfaToken.value = null;
    mfaMethods.value = [];
    mfaSelectedMethod.value = null;
    mfaChallenge.value = null;
  }

  /**
   * Extract error message
   */
  function getErrorMessage(err: unknown): string {
    if (err instanceof Error) {
      return err.message;
    }
    if (typeof err === 'object' && err !== null) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      return axiosError.response?.data?.message || 'An error occurred';
    }
    return 'An error occurred';
  }

  /**
   * Reset store
   */
  function $reset(): void {
    clearTokens();
    resetMfaState();
    resetOtpState();
    isLoading.value = false;
    error.value = null;
  }

  return {
    // State
    accessToken,
    refreshToken,
    isLoading,
    error,
    mfaRequired,
    mfa,
    otpRequired,
    otp,

    // Computed
    isAuthenticated,

    // Actions
    login,
    requestMfaChallenge,
    verifyMfaCode,
    cancelMfa,
    logout,
    setTokens,
    $reset,

    // OTP Login Actions
    checkAuthMethod,
    requestOtp,
    verifyOtp,
    cancelOtp,
    otpGoBack,
  };
});
