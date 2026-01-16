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
 * Get all alert types
 */
export async function getAlertTypes(entityId: string): Promise<AlertType[]> {
  const response = await api.get(`/entities/${entityId}/alert-types`);
  return response.data.data || [];
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
 */
export async function bulkUpdatePreferences(
  entityId: string,
  data: BulkPreferenceUpdate
): Promise<{ success: number; failed: number }> {
  const response = await api.post(
    `/entities/${entityId}/alert-preferences/bulk`,
    data
  );
  return response.data;
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
