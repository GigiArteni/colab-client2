/**
 * Usage Store - Manages consumption/usage state.
 *
 * IDs are strings throughout (matches BE convention + types).
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { usageService, type SubmitReadingPayload } from 'src/services/usage.service';
import type {
  UsageRecord,
  Meter,
  MeterReading,
  UsageStatistics,
  PaginationMeta,
} from 'src/types';

export const useUsageStore = defineStore('usage', () => {
  // State
  const usages = ref<UsageRecord[]>([]);
  const meters = ref<Meter[]>([]);
  const readings = ref<MeterReading[]>([]);
  const statistics = ref<UsageStatistics | null>(null);
  const pagination = ref<PaginationMeta | null>(null);
  const isLoading = ref(false);
  const isSubmitting = ref(false);
  const error = ref<string | null>(null);

  // Selected meter for filtering
  const selectedMeterId = ref<string | null>(null);

  // Computed
  const currentMonthUsage = computed(() => statistics.value?.current_month ?? 0);
  const previousMonthUsage = computed(() => statistics.value?.previous_month ?? 0);
  const usageChangePercent = computed(() => statistics.value?.change_percent ?? 0);
  const usageTrend = computed(() => statistics.value?.trend ?? 'stable');
  const usageUnit = computed(() => statistics.value?.unit ?? 'm³');

  const activeMeters = computed(() =>
    meters.value.filter((m) => (m as { is_active?: boolean }).is_active !== false),
  );

  const selectedMeter = computed(
    () => meters.value.find((m) => m.id === selectedMeterId.value) ?? null,
  );

  const filteredUsages = computed(() => {
    if (!selectedMeterId.value) return usages.value;
    return usages.value.filter((u) => u.meter_id === selectedMeterId.value);
  });

  // Chart data for last 12 months — falls back gracefully when consumption/date missing
  const chartData = computed(() => {
    const sortedUsages = [...usages.value]
      .filter((u): u is UsageRecord & { reading_end_date: string; consumption: number } =>
        Boolean(u.reading_end_date) && typeof u.consumption === 'number',
      )
      .sort(
        (a, b) =>
          new Date(a.reading_end_date).getTime() - new Date(b.reading_end_date).getTime(),
      )
      .slice(-12);

    const labels = sortedUsages.map((u) => {
      const date = new Date(u.reading_end_date);
      return date.toLocaleDateString('ro-RO', { month: 'short', year: '2-digit' });
    });

    const data = sortedUsages.map((u) => u.consumption);

    return { labels, data };
  });

  // Actions
  async function fetchUsages(entityId: string, subscriptionId?: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = subscriptionId
        ? await usageService.getSubscriptionUsages(entityId, subscriptionId)
        : await usageService.getUsages(entityId);

      usages.value = response.data ?? [];

      if (response.meta) {
        pagination.value = response.meta;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Eroare la încărcarea consumului';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchMeters(entityId: string, subscriptionId: string): Promise<void> {
    try {
      meters.value = await usageService.getMeters(entityId, subscriptionId);

      const firstMeter = meters.value[0];
      if (!selectedMeterId.value && firstMeter) {
        selectedMeterId.value = firstMeter.id;
      }
    } catch (err) {
      console.error('Failed to fetch meters:', err);
    }
  }

  async function fetchMeterReadings(
    entityId: string,
    subscriptionId: string,
    meterId: string,
  ): Promise<void> {
    try {
      const response = await usageService.getMeterReadings(entityId, subscriptionId, meterId);
      readings.value = response.data ?? [];
    } catch (err) {
      console.error('Failed to fetch meter readings:', err);
    }
  }

  async function fetchStatistics(entityId: string, subscriptionId: string): Promise<void> {
    try {
      statistics.value = await usageService.getStatistics(entityId, subscriptionId);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
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
    entityId: string,
    subscriptionId: string,
    data: SubmitReadingPayload,
  ): Promise<MeterReading> {
    isSubmitting.value = true;
    error.value = null;

    try {
      const reading = await usageService.submitReading(entityId, subscriptionId, data);

      readings.value.unshift(reading);

      const meter = meters.value.find((m) => m.id === data.meter_id);
      if (meter) {
        meter.last_reading = data.current_index;
        const newDate = reading.reading_date ?? reading.reading_end_date;
        if (newDate !== undefined) {
          meter.last_reading_date = newDate;
        }
      }

      return reading;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Eroare la trimiterea citirii';
      throw err;
    } finally {
      isSubmitting.value = false;
    }
  }

  function selectMeter(meterId: string | null): void {
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
