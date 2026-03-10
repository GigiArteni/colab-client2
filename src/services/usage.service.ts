/**
 * Usage Service
 * Consumption/usage data for subscriptions
 */

import { api } from 'src/boot/axios';
import type { UsageRecord, UsageFilters, PaginatedResponse } from 'src/types';

export const usageService = {
  /**
   * Get usage records for a subscription
   */
  async getUsages(
    entityId: string,
    subscriptionId: string,
    filters?: UsageFilters
  ): Promise<UsageRecord[]> {
    const params: Record<string, unknown> = {};

    if (filters?.period) {
      params['period'] = filters.period;
    }
    if (filters?.meter_id) {
      params['filter[meter_id]'] = filters.meter_id;
    }

    const response = await api.get<PaginatedResponse<UsageRecord>>(
      `/entities/${entityId}/subscriptions/${subscriptionId}/usages`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get single usage record
   */
  async getUsage(
    entityId: string,
    subscriptionId: string,
    usageId: string
  ): Promise<UsageRecord> {
    const response = await api.get<{ data: UsageRecord }>(
      `/entities/${entityId}/subscriptions/${subscriptionId}/usages/${usageId}`
    );
    return response.data.data;
  },
};
