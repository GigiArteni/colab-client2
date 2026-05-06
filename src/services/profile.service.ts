/**
 * Profile Service - API calls for user profile management
 */

import { api } from 'src/boot/axios';
import type {
  UpdateProfilePayload,
  ChangePasswordPayload,
  UserPreferences,
  UpdatePreferencesPayload,
  ContactMessage,
  ProfileSettings,
  UpdateProfileSettingsPayload,
  DeviceToken,
} from 'src/types';

const PROFILE_ENDPOINTS = {
  PROFILE: '/profile',
  PASSWORD: '/profile/password',
  PREFERENCES: '/profile/preferences',
  SETTINGS: '/profile/settings',
  CONTACT: '/support/messages',
  DEVICE_TOKEN: '/profile/device-token',
  DEVICE_TOKENS: '/profile/device-tokens',
};

export const profileService = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<{ data: Record<string, unknown> }> {
    const response = await api.get(PROFILE_ENDPOINTS.PROFILE);
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfilePayload): Promise<{ data: Record<string, unknown> }> {
    const response = await api.patch(PROFILE_ENDPOINTS.PROFILE, data);
    return response.data;
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordPayload): Promise<void> {
    await api.post(PROFILE_ENDPOINTS.PASSWORD, data);
  },

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    const response = await api.get<{ data: UserPreferences }>(PROFILE_ENDPOINTS.PREFERENCES);
    return response.data.data;
  },

  /**
   * Update user preferences
   */
  async updatePreferences(data: UpdatePreferencesPayload): Promise<UserPreferences> {
    const response = await api.patch<{ data: UserPreferences }>(
      PROFILE_ENDPOINTS.PREFERENCES,
      data
    );
    return response.data.data;
  },

  /**
   * Send contact/support message
   */
  async sendContactMessage(data: ContactMessage): Promise<void> {
    await api.post(PROFILE_ENDPOINTS.CONTACT, data);
  },

  /**
   * Register device token for push notifications
   */
  async registerDeviceToken(token: string, platform: 'ios' | 'android' | 'web'): Promise<void> {
    await api.post(PROFILE_ENDPOINTS.DEVICE_TOKEN, {
      token,
      platform,
    });
  },

  /**
   * Unregister device token (on logout)
   */
  async unregisterDeviceToken(token: string): Promise<void> {
    await api.delete(PROFILE_ENDPOINTS.DEVICE_TOKEN, {
      data: { token },
    });
  },

  /**
   * Get profile settings (notification prefs, language, timezone, channels)
   */
  async getSettings(): Promise<ProfileSettings> {
    const response = await api.get<{ data: ProfileSettings }>(PROFILE_ENDPOINTS.SETTINGS);
    return response.data.data;
  },

  /**
   * Update profile settings (partial PATCH)
   */
  async updateSettings(data: UpdateProfileSettingsPayload): Promise<ProfileSettings> {
    const response = await api.patch<{ data: ProfileSettings }>(PROFILE_ENDPOINTS.SETTINGS, data);
    return response.data.data;
  },

  /**
   * List all registered push device tokens
   */
  async listDevices(): Promise<DeviceToken[]> {
    const response = await api.get<{ data: DeviceToken[] }>(PROFILE_ENDPOINTS.DEVICE_TOKENS);
    return response.data.data;
  },

  /**
   * Revoke a specific registered device token
   */
  async revokeDevice(id: string): Promise<void> {
    await api.delete(`${PROFILE_ENDPOINTS.DEVICE_TOKENS}/${id}`);
  },
};
