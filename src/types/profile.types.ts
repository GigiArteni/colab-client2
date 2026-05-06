// Profile Types

export interface UpdateProfilePayload {
  first_name: string;
  last_name: string;
  email: string;
  mobile?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface UserPreferences {
  language: string;
  push_notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
}

export interface UpdatePreferencesPayload {
  language?: string;
  push_notifications_enabled?: boolean;
  email_notifications_enabled?: boolean;
  sms_notifications_enabled?: boolean;
}

export interface ContactMessage {
  subject: string;
  message: string;
  contact_method?: 'email' | 'phone' | 'any';
}

export type NotificationCategory =
  | 'invoice'
  | 'payment'
  | 'reading'
  | 'subscription'
  | 'maintenance'
  | 'alert'
  | 'general';

export interface NotificationChannelPrefs {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export interface ProfileSettings {
  notification_preferences: Record<NotificationCategory, NotificationChannelPrefs>;
  language: string;
  timezone: string;
  communication_channels: {
    preferred_channel: 'email' | 'sms' | 'any';
    email_override?: string;
    phone_override?: string;
  };
}

export type UpdateProfileSettingsPayload = Partial<ProfileSettings>;

export interface DeviceToken {
  id: string;
  device_name: string;
  platform: 'ios' | 'android' | 'web';
  last_used: string | null;
  created_at: string;
}

export interface ContactSettings {
  contact_id: string;
  billing_email_override?: string;
  preferred_notification_channel: 'email' | 'sms' | 'any';
  receive_invoices: boolean;
  receive_alerts: boolean;
  receive_readings_reminders: boolean;
}

export type UpdateContactSettingsPayload = Partial<Omit<ContactSettings, 'contact_id'>>;
