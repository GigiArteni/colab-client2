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
