/**
 * Profile Service - API calls for user profile management
 */

import api from './api';
import type {
  UpdateProfilePayload,
  ChangePasswordPayload,
  UserPreferences,
  UpdatePreferencesPayload,
  ContactMessage,
} from 'src/types';

const PROFILE_ENDPOINTS = {
  PROFILE: '/profile',
  PASSWORD: '/profile/password',
  PREFERENCES: '/profile/preferences',
  CONTACT: '/support/messages',
  DEVICE_TOKEN: '/profile/device-token',
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
};
