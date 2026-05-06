/**
 * Alert Preference Service
 * API service for managing customer alert preferences
 */

import { api } from 'boot/axios';
import type {
  AlertPreference,
  AlertType,
  BulkPreferenceUpdate,
} from 'src/types/alertPreference.types';

/**
 * Get all alert types (static list — no dedicated BE endpoint exists)
 */
export function getAlertTypes(): AlertType[] {
  return [
    { id: 'invoice', code: 'invoice', category: 'invoice', name: 'Invoice', priority: 'normal' },
    { id: 'payment', code: 'payment', category: 'payment', name: 'Payment', priority: 'normal' },
    { id: 'subscription', code: 'subscription', category: 'subscription', name: 'Subscription', priority: 'normal' },
    { id: 'meter', code: 'meter', category: 'meter', name: 'Meter', priority: 'normal' },
    { id: 'inspection', code: 'inspection', category: 'inspection', name: 'Inspection', priority: 'normal' },
    { id: 'usage', code: 'usage', category: 'usage', name: 'Usage', priority: 'normal' },
    { id: 'disconnection', code: 'disconnection', category: 'disconnection', name: 'Disconnection', priority: 'high' },
    { id: 'compliance', code: 'compliance', category: 'compliance', name: 'Compliance', priority: 'high' },
    { id: 'subsidy', code: 'subsidy', category: 'subsidy', name: 'Subsidy', priority: 'normal' },
    { id: 'general', code: 'general', category: 'general', name: 'General', priority: 'low' },
  ];
}

/**
 * Get alert preferences for a contact (includes defaults for missing types)
 */
export async function getContactPreferences(
  entityId: string,
  contactId: string
): Promise<AlertPreference[]> {
  const response = await api.get(
    `/entities/${entityId}/alert-preferences/contact/${contactId}`
  );
  return response.data.data || [];
}

/**
 * Get single alert preference by ID
 */
export async function getPreference(
  entityId: string,
  preferenceId: string
): Promise<AlertPreference> {
  const response = await api.get(
    `/entities/${entityId}/alert-preferences/${preferenceId}`
  );
  return response.data.data;
}

/**
 * Create or update single preference (upsert)
 */
export async function upsertPreference(
  entityId: string,
  data: {
    alert_type_id: string;
    preferenceable_type: string;
    preferenceable_id: string;
    email_enabled?: boolean;
    sms_enabled?: boolean;
    whatsapp_enabled?: boolean;
    print_enabled?: boolean;
    in_app_enabled?: boolean;
    quiet_hours_start?: string;
    quiet_hours_end?: string;
  }
): Promise<AlertPreference> {
  const response = await api.post(`/entities/${entityId}/alert-preferences`, data);
  return response.data.data;
}

/**
 * Update existing preference
 */
export async function updatePreference(
  entityId: string,
  preferenceId: string,
  data: Partial<AlertPreference>
): Promise<AlertPreference> {
  const response = await api.put(
    `/entities/${entityId}/alert-preferences/${preferenceId}`,
    data
  );
  return response.data.data;
}

/**
 * Bulk update preferences (transactional)
 * BE returns: { message, updated, created }
 */
export async function bulkUpdatePreferences(
  entityId: string,
  data: BulkPreferenceUpdate
): Promise<{ message: string; updated: number; created: number }> {
  const response = await api.post(
    `/entities/${entityId}/alert-preferences/bulk`,
    data
  );
  return response.data as { message: string; updated: number; created: number };
}

/**
 * Opt out from specific alert type
 */
export async function optOut(
  entityId: string,
  preferenceId: string,
  reason?: string
): Promise<AlertPreference> {
  const response = await api.post(
    `/entities/${entityId}/alert-preferences/${preferenceId}/opt-out`,
    { opt_out_reason: reason }
  );
  return response.data.data;
}

/**
 * Opt in to specific alert type
 */
export async function optIn(
  entityId: string,
  preferenceId: string
): Promise<AlertPreference> {
  const response = await api.post(
    `/entities/${entityId}/alert-preferences/${preferenceId}/opt-in`
  );
  return response.data.data;
}

/**
 * Delete preference (reset to defaults)
 */
export async function deletePreference(
  entityId: string,
  preferenceId: string
): Promise<void> {
  await api.delete(`/entities/${entityId}/alert-preferences/${preferenceId}`);
}
