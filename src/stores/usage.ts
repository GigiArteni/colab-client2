/**
 * Usage Store - Manages consumption/usage state
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { usageService } from 'src/services/usage.service';
import type {
  Usage,
  Meter,
  MeterReading,
  UsageStatistics,
  SubmitReadingPayload,
  PaginationMeta,
} from 'src/types';

export const useUsageStore = defineStore('usage', () => {
  // State
  const usages = ref<Usage[]>([]);
  const meters = ref<Meter[]>([]);
  const readings = ref<MeterReading[]>([]);
  const statistics = ref<UsageStatistics | null>(null);
  const pagination = ref<PaginationMeta | null>(null);
  const isLoading = ref(false);
  const isSubmitting = ref(false);
  const error = ref<string | null>(null);

  // Selected meter for filtering
  const selectedMeterId = ref<number | null>(null);

  // Computed
  const currentMonthUsage = computed(() => statistics.value?.current_month || 0);

  const previousMonthUsage = computed(() => statistics.value?.previous_month || 0);

  const usageChangePercent = computed(() => statistics.value?.change_percent || 0);

  const usageTrend = computed(() => statistics.value?.trend || 'stable');

  const usageUnit = computed(() => statistics.value?.unit || 'm³');

  const activeMeters = computed(() => meters.value.filter((m) => m.is_active));

  const selectedMeter = computed(() =>
    meters.value.find((m) => m.id === selectedMeterId.value) || null
  );

  const filteredUsages = computed(() => {
    if (!selectedMeterId.value) return usages.value;
    return usages.value.filter((u) => u.meter_id === selectedMeterId.value);
  });

  // Chart data for last 12 months
  const chartData = computed(() => {
    const sortedUsages = [...usages.value]
      .sort((a, b) => new Date(a.period_end).getTime() - new Date(b.period_end).getTime())
      .slice(-12);

    const labels = sortedUsages.map((u) => {
      const date = new Date(u.period_end);
      return date.toLocaleDateString('ro-RO', { month: 'short', year: '2-digit' });
    });

    const data = sortedUsages.map((u) => u.consumption);

    return { labels, data };
  });

  // Actions
  async function fetchUsages(
    entityId: number,
    subscriptionId?: number
  ): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      let response;
      if (subscriptionId) {
        response = await usageService.getSubscriptionUsages(entityId, subscriptionId);
      } else {
        response = await usageService.getUsages(entityId);
      }

      usages.value = response.data || [];

      if (response.meta?.pagination) {
        pagination.value = response.meta.pagination;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Eroare la încărcarea consumului';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchMeters(
    entityId: number,
    subscriptionId: number
  ): Promise<void> {
    try {
      meters.value = await usageService.getMeters(entityId, subscriptionId);

      // Auto-select first meter if none selected
      const firstMeter = meters.value[0];
      if (!selectedMeterId.value && firstMeter) {
        selectedMeterId.value = firstMeter.id;
      }
    } catch (err) {
      console.error('Failed to fetch meters:', err);
    }
  }

  async function fetchMeterReadings(
    entityId: number,
    subscriptionId: number,
    meterId: number
  ): Promise<void> {
    try {
      const response = await usageService.getMeterReadings(
        entityId,
        subscriptionId,
        meterId
      );
      readings.value = response.data || [];
    } catch (err) {
      console.error('Failed to fetch meter readings:', err);
    }
  }

  async function fetchStatistics(
    entityId: number,
    subscriptionId: number
  ): Promise<void> {
    try {
      statistics.value = await usageService.getStatistics(entityId, subscriptionId);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
      // Set default statistics if API fails
      statistics.value = {
        current_month: 0,
        previous_month: 0,
        same_month_last_year: null,
        average_monthly: 0,
        total_year: 0,
        unit: 'm³',
        change_percent: 0,
        trend: 'stable',
      };
    }
  }

  async function submitReading(
    entityId: number,
    subscriptionId: number,
    data: SubmitReadingPayload
  ): Promise<MeterReading> {
    isSubmitting.value = true;
    error.value = null;

    try {
      const reading = await usageService.submitReading(entityId, subscriptionId, data);

      // Add to readings list
      readings.value.unshift(reading);

      // Update meter's last reading
      const meter = meters.value.find((m) => m.id === data.meter_id);
      if (meter) {
        meter.last_reading = data.reading;
        meter.last_reading_date = reading.reading_date;
      }

      return reading;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Eroare la trimiterea citirii';
      throw err;
    } finally {
      isSubmitting.value = false;
    }
  }

  function selectMeter(meterId: number | null): void {
    selectedMeterId.value = meterId;
  }

  function reset(): void {
    usages.value = [];
    meters.value = [];
    readings.value = [];
    statistics.value = null;
    pagination.value = null;
    selectedMeterId.value = null;
    error.value = null;
  }

  return {
    // State
    usages,
    meters,
    readings,
    statistics,
    pagination,
    isLoading,
    isSubmitting,
    error,
    selectedMeterId,

    // Computed
    currentMonthUsage,
    previousMonthUsage,
    usageChangePercent,
    usageTrend,
    usageUnit,
    activeMeters,
    selectedMeter,
    filteredUsages,
    chartData,

    // Actions
    fetchUsages,
    fetchMeters,
    fetchMeterReadings,
    fetchStatistics,
    submitReading,
    selectMeter,
    reset,
  };
});
