/**
 * Alert Preference Types
 * Type definitions for customer alert preferences
 */

import type { AlertType } from './alert.types';

export interface AlertPreference {
  id?: string;
  entity_id: string;
  alert_type_id: string;
  alert_type?: AlertType;
  preferenceable_type: string;
  preferenceable_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  print_enabled: boolean;
  in_app_enabled: boolean;
  opted_out: boolean;
  opted_out_at?: string;
  opt_out_reason?: string;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  enabled_channels?: string[];
  created_at?: string;
  updated_at?: string;
}

export type AlertCategory =
  | 'invoice'
  | 'payment'
  | 'subscription'
  | 'meter'
  | 'inspection'
  | 'usage'
  | 'disconnection'
  | 'compliance'
  | 'subsidy'
  | 'general';

export type AlertPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface AlertPreferenceUpdate {
  alert_type_id: string;
  preferenceable_type: string;
  preferenceable_id: string;
  email_enabled?: boolean;
  sms_enabled?: boolean;
  whatsapp_enabled?: boolean;
  print_enabled?: boolean;
  in_app_enabled?: boolean;
  opted_out?: boolean;
  opt_out_reason?: string;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

export interface BulkPreferenceUpdate {
  preferences: AlertPreferenceUpdate[];
}

export interface CategoryInfo {
  value: AlertCategory;
  label: string;
  icon: string;
  color: string;
}

export interface ChannelInfo {
  value: string;
  label: string;
  icon: string;
  color: string;
}
