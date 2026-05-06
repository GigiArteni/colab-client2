/**
 * Alert Service
 * Handles customer alert operations
 */

import { api } from 'src/boot/axios';
import type { Alert, AlertableType, PaginatedAlerts, AlertStats } from 'src/types/alert.types';

/**
 * Get paginated alerts for current user's contact
 */
export async function getAlerts(
  entityId: string,
  contactId: string,
  params?: {
    page?: number;
    per_page?: number;
    status?: string;
    priority?: string;
    channel?: string;
    dismissed?: boolean;
  }
): Promise<PaginatedAlerts> {
  const response = await api.get(
    `/entities/${entityId}/contacts/${contactId}/alerts`,
    { params }
  );
  return response.data;
}

/**
 * Get alert statistics
 */
export async function getAlertStats(
  entityId: string
): Promise<AlertStats> {
  const response = await api.get(`/entities/${entityId}/alerts/stats`);
  return response.data.data;
}

/**
 * Dismiss an alert
 */
export async function dismissAlert(
  entityId: string,
  contactId: string,
  alertId: string
): Promise<Alert> {
  const response = await api.post(
    `/entities/${entityId}/contacts/${contactId}/alerts/${alertId}/dismiss`
  );
  return response.data.data;
}

/**
 * Bulk dismiss multiple alerts
 */
export async function bulkDismissAlerts(
  entityId: string,
  contactId: string,
  alertIds: string[]
): Promise<{ success: string[]; failed: string[] }> {
  const response = await api.post(
    `/entities/${entityId}/contacts/${contactId}/alerts/bulk-dismiss`,
    { alert_ids: alertIds }
  );
  return response.data.data;
}

/**
 * Dismiss an alert on a polymorphic resource (invoice/usage/meter)
 */
export async function dismissAlertOnResource(
  entityId: string,
  type: AlertableType,
  resourceId: string,
  alertId: string
): Promise<Alert> {
  const response = await api.post(
    `/entities/${entityId}/${type}/${resourceId}/alerts/${alertId}/dismiss`
  );
  return response.data.data;
}

export const alertService = {
  getAlerts,
  getAlertStats,
  dismissAlert,
  bulkDismissAlerts,
  dismissAlertOnResource,
};
