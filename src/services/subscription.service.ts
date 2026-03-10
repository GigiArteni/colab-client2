/**
 * Subscription Service
 * Customer's utility subscriptions (contracts)
 */

import { api } from 'src/boot/axios';
import type {
  Subscription,
  Meter,
  UsageStatistics,
  FinancialStatistics,
  PaginatedResponse,
} from 'src/types';

export const subscriptionService = {
  /**
   * Get subscriptions for an entity (customer-filtered)
   */
  async getSubscriptions(entityId: string, params?: Record<string, unknown>): Promise<Subscription[]> {
    const response = await api.get<PaginatedResponse<Subscription>>(
      `/entities/${entityId}/subscriptions`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get single subscription
   */
  async getSubscription(entityId: string, subscriptionId: string): Promise<Subscription> {
    const response = await api.get<{ data: Subscription }>(
      `/entities/${entityId}/subscriptions/${subscriptionId}`
    );
    return response.data.data;
  },

  /**
   * Get meters for a subscription
   */
  async getMeters(entityId: string, subscriptionId: string): Promise<Meter[]> {
    const response = await api.get<PaginatedResponse<Meter>>(
      `/entities/${entityId}/subscriptions/${subscriptionId}/meters`
    );
    return response.data.data;
  },

  /**
   * Get usage statistics for a subscription
   */
  async getUsageStatistics(entityId: string, subscriptionId: string): Promise<UsageStatistics> {
    const response = await api.get<{ data: UsageStatistics }>(
      `/entities/${entityId}/subscriptions/${subscriptionId}/statistics/usage`
    );
    return response.data.data;
  },

  /**
   * Get financial statistics for a subscription
   */
  async getFinancialStatistics(entityId: string, subscriptionId: string): Promise<FinancialStatistics> {
    const response = await api.get<{ data: FinancialStatistics }>(
      `/entities/${entityId}/subscriptions/${subscriptionId}/statistics/financial`
    );
    return response.data.data;
  },
};
