/**
 * Usage Service
 * Consumption/usage data for subscriptions.
 *
 * Most underlying endpoints live on the meter / subscription routes; this
 * service exposes the customer-portal-facing API surface used by the usage
 * store. Several methods proxy to meterService — keeping a single entry point
 * makes mocking easier in tests and decouples store callsites from the
 * underlying transport.
 */

import { api } from 'src/boot/axios';
import { meterService } from 'src/services/meter.service';
import type {
  Meter,
  MeterReading,
  MeterReadingSubmission,
  UsageRecord,
  UsageFilters,
  UsageStatistics,
  PaginatedResponse,
} from 'src/types';

export type SubmitReadingPayload = MeterReadingSubmission & { meter_id: string };

export const usageService = {
  /**
   * Get usage records for a subscription
   */
  async getSubscriptionUsages(
    entityId: string,
    subscriptionId: string,
    filters?: UsageFilters,
  ): Promise<PaginatedResponse<UsageRecord>> {
    const params: Record<string, unknown> = {};

    if (filters?.period) {
      params['period'] = filters.period;
    }
    if (filters?.meter_id) {
      params['filter[meter_id]'] = filters.meter_id;
    }

    const response = await api.get<PaginatedResponse<UsageRecord>>(
      `/entities/${entityId}/subscriptions/${subscriptionId}/usages`,
      { params },
    );
    return response.data;
  },

  /**
   * Get all usage records for an entity (no subscription scope)
   */
  async getUsages(entityId: string): Promise<PaginatedResponse<UsageRecord>> {
    const response = await api.get<PaginatedResponse<UsageRecord>>(
      `/entities/${entityId}/usages`,
    );
    return response.data;
  },

  /**
   * Get single usage record
   */
  async getUsage(
    entityId: string,
    subscriptionId: string,
    usageId: string,
  ): Promise<UsageRecord> {
    const response = await api.get<{ data: UsageRecord }>(
      `/entities/${entityId}/subscriptions/${subscriptionId}/usages/${usageId}`,
    );
    return response.data.data;
  },

  /**
   * Get meters for a subscription (proxies to meterService)
   */
  async getMeters(entityId: string, subscriptionId: string): Promise<Meter[]> {
    return meterService.getSubscriptionMeters(entityId, subscriptionId);
  },

  /**
   * Get readings/history for a single meter (proxies to meterService)
   */
  async getMeterReadings(
    entityId: string,
    subscriptionId: string,
    meterId: string,
  ): Promise<PaginatedResponse<MeterReading>> {
    return meterService.getReadings(entityId, subscriptionId, meterId);
  },

  /**
   * Get usage statistics for a subscription
   */
  async getStatistics(
    entityId: string,
    subscriptionId: string,
  ): Promise<UsageStatistics> {
    const response = await api.get<{ data: UsageStatistics }>(
      `/entities/${entityId}/subscriptions/${subscriptionId}/statistics/usage`,
    );
    return response.data.data;
  },

  /**
   * Submit a meter reading (proxies to meterService)
   */
  async submitReading(
    entityId: string,
    subscriptionId: string,
    data: SubmitReadingPayload,
  ): Promise<MeterReading> {
    const { meter_id, ...rest } = data;
    return meterService.submitReading(entityId, subscriptionId, meter_id, rest);
  },
};
