/**
 * Meter Service
 * Gas meter management for customer portal
 */

import { api } from 'src/boot/axios';
import type {
  Meter,
  MeterActivity,
  MeterReading,
  MeterReadingSubmission,
  MeterStatusCounts,
  MeterFilters,
  PaginatedResponse,
} from 'src/types';

export const meterService = {
  /**
   * Get all meters for an entity (customer-filtered)
   */
  async getMeters(entityId: string, filters?: MeterFilters): Promise<Meter[]> {
    const params: Record<string, unknown> = {};

    if (filters?.group) {
      params['filter[group]'] = filters.group;
    }
    if (filters?.status) {
      params['filter[status]'] = filters.status;
    }
    if (filters?.type) {
      params['filter[type]'] = filters.type;
    }
    if (filters?.search) {
      params['search'] = filters.search;
    }
    if (filters?.subscription_id) {
      params['filter[subscription_id]'] = filters.subscription_id;
    }

    // Include relations
    params['include'] = 'subscription,creator';

    const response = await api.get<PaginatedResponse<Meter>>(
      `/entities/${entityId}/meters`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get single meter by ID
   */
  async getMeter(entityId: string, meterId: string): Promise<Meter> {
    const response = await api.get<{ data: Meter }>(
      `/entities/${entityId}/meters/${meterId}`,
      { params: { include: 'subscription,creator,updater' } }
    );
    return response.data.data;
  },

  /**
   * Get meters for a specific subscription
   */
  async getSubscriptionMeters(entityId: string, subscriptionId: string): Promise<Meter[]> {
    const response = await api.get<PaginatedResponse<Meter>>(
      `/entities/${entityId}/subscriptions/${subscriptionId}/meters`,
      { params: { include: 'creator' } }
    );
    return response.data.data;
  },

  /**
   * Get meter status counts
   */
  async getStatusCounts(entityId: string, group?: string): Promise<MeterStatusCounts> {
    const params: Record<string, unknown> = {};
    if (group) {
      params['filter[group]'] = group;
    }

    const response = await api.get<{ data: MeterStatusCounts }>(
      `/entities/${entityId}/meters/status-counts`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get meter activities (audit log)
   */
  async getActivities(
    entityId: string,
    meterId: string,
    params?: { page?: number; per_page?: number; group?: string; type?: string }
  ): Promise<PaginatedResponse<MeterActivity>> {
    const queryParams: Record<string, unknown> = {
      include: 'causer,subject',
    };

    if (params?.page) {
      queryParams['page'] = params.page;
    }
    if (params?.per_page) {
      queryParams['per_page'] = params.per_page;
    }
    if (params?.group) {
      queryParams['filter[group]'] = params.group;
    }
    if (params?.type) {
      queryParams['filter[type]'] = params.type;
    }

    const response = await api.get<PaginatedResponse<MeterActivity>>(
      `/entities/${entityId}/meters/${meterId}/activities`,
      { params: queryParams }
    );
    return response.data;
  },

  /**
   * Get meter readings/usage history
   */
  async getReadings(
    entityId: string,
    subscriptionId: string,
    meterId: string,
    params?: { page?: number; per_page?: number }
  ): Promise<PaginatedResponse<MeterReading>> {
    const queryParams: Record<string, unknown> = {
      'filter[meter_id]': meterId,
      'sort': '-reading_end_date',
    };

    if (params?.page) {
      queryParams['page'] = params.page;
    }
    if (params?.per_page) {
      queryParams['per_page'] = params.per_page;
    }

    const response = await api.get<PaginatedResponse<MeterReading>>(
      `/entities/${entityId}/subscriptions/${subscriptionId}/usages`,
      { params: queryParams }
    );
    return response.data;
  },

  /**
   * Submit a meter reading (self-reading by customer)
   */
  async submitReading(
    entityId: string,
    subscriptionId: string,
    meterId: string,
    data: MeterReadingSubmission
  ): Promise<MeterReading> {
    const payload = {
      meter_id: meterId,
      current_index: data.current_index,
      reading_date: data.reading_date || new Date().toISOString().split('T')[0],
      reading_source: 'customer',
      notes: data.notes,
    };

    const response = await api.post<{ data: MeterReading }>(
      `/entities/${entityId}/subscriptions/${subscriptionId}/usages`,
      payload
    );
    return response.data.data;
  },
};
