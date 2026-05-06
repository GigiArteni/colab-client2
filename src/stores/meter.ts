/**
 * Meter Store
 * Manages gas meters for customer portal
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { meterService } from 'src/services/meter.service';
import type {
  Meter,
  MeterActivity,
  MeterReading,
  MeterReadingSubmission,
  MeterStatusCounts,
  MeterFilters,
} from 'src/types';

export const useMeterStore = defineStore('meter', () => {
  // State
  const meters = ref<Meter[]>([]);
  const selectedMeter = ref<Meter | null>(null);
  const activities = ref<MeterActivity[]>([]);
  const readings = ref<MeterReading[]>([]);
  const statusCounts = ref<MeterStatusCounts | null>(null);

  const isLoading = ref(false);
  const isLoadingMeter = ref(false);
  const isLoadingActivities = ref(false);
  const isLoadingReadings = ref(false);
  const isSubmitting = ref(false);

  const activitiesPagination = ref<{ page: number; lastPage: number; total: number }>({
    page: 1,
    lastPage: 1,
    total: 0,
  });

  const readingsPagination = ref<{ page: number; lastPage: number; total: number }>({
    page: 1,
    lastPage: 1,
    total: 0,
  });

  // Computed
  const gasMeters = computed(() =>
    meters.value.filter((m) => m.group === 'natural-gas')
  );

  const activeMeters = computed(() =>
    meters.value.filter((m) => m.status === 'active')
  );

  const hasMeters = computed(() => meters.value.length > 0);

  /**
   * Fetch all meters for entity
   */
  async function fetchMeters(entityId: string, filters?: MeterFilters): Promise<void> {
    if (isLoading.value) return;

    isLoading.value = true;

    try {
      meters.value = await meterService.getMeters(entityId, filters);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch single meter
   */
  async function fetchMeter(entityId: string, meterId: string): Promise<void> {
    isLoadingMeter.value = true;

    try {
      selectedMeter.value = await meterService.getMeter(entityId, meterId);
    } finally {
      isLoadingMeter.value = false;
    }
  }

  /**
   * Fetch meter status counts
   */
  async function fetchStatusCounts(entityId: string, group?: string): Promise<void> {
    try {
      statusCounts.value = await meterService.getStatusCounts(entityId, group);
    } catch (error) {
      console.error('Failed to fetch status counts:', error);
    }
  }

  /**
   * Fetch meter activities
   */
  async function fetchActivities(
    entityId: string,
    meterId: string,
    page = 1
  ): Promise<void> {
    isLoadingActivities.value = true;

    try {
      const response = await meterService.getActivities(entityId, meterId, {
        page,
        per_page: 20,
      });

      if (page === 1) {
        activities.value = response.data;
      } else {
        activities.value = [...activities.value, ...response.data];
      }

      activitiesPagination.value = {
        page: response.meta.current_page,
        lastPage: response.meta.last_page,
        total: response.meta.total,
      };
    } finally {
      isLoadingActivities.value = false;
    }
  }

  /**
   * Fetch meter readings
   */
  async function fetchReadings(
    entityId: string,
    subscriptionId: string,
    meterId: string,
    page = 1
  ): Promise<void> {
    isLoadingReadings.value = true;

    try {
      const response = await meterService.getReadings(
        entityId,
        subscriptionId,
        meterId,
        { page, per_page: 20 }
      );

      if (page === 1) {
        readings.value = response.data;
      } else {
        readings.value = [...readings.value, ...response.data];
      }

      readingsPagination.value = {
        page: response.meta.current_page,
        lastPage: response.meta.last_page,
        total: response.meta.total,
      };
    } finally {
      isLoadingReadings.value = false;
    }
  }

  /**
   * Submit a meter reading
   */
  async function submitReading(
    entityId: string,
    subscriptionId: string,
    meterId: string,
    data: MeterReadingSubmission
  ): Promise<MeterReading> {
    isSubmitting.value = true;

    try {
      const reading = await meterService.submitReading(
        entityId,
        subscriptionId,
        meterId,
        data
      );

      // Add to readings list
      readings.value = [reading, ...readings.value];

      // Update meter's current index if we have it selected
      if (selectedMeter.value?.id === meterId) {
        selectedMeter.value.current_index = data.current_index;
        selectedMeter.value.last_reading_date = reading.created_at;
      }

      // Update in meters list
      const meterToUpdate = meters.value.find((m) => m.id === meterId);
      if (meterToUpdate) {
        meterToUpdate.current_index = data.current_index;
        meterToUpdate.last_reading_date = reading.created_at;
      }

      return reading;
    } finally {
      isSubmitting.value = false;
    }
  }

  /**
   * Clear selected meter data
   */
  function clearSelectedMeter(): void {
    selectedMeter.value = null;
    activities.value = [];
    readings.value = [];
    activitiesPagination.value = { page: 1, lastPage: 1, total: 0 };
    readingsPagination.value = { page: 1, lastPage: 1, total: 0 };
  }

  /**
   * Reset store state
   */
  function $reset(): void {
    meters.value = [];
    selectedMeter.value = null;
    activities.value = [];
    readings.value = [];
    statusCounts.value = null;
    isLoading.value = false;
    isLoadingMeter.value = false;
    isLoadingActivities.value = false;
    isLoadingReadings.value = false;
    isSubmitting.value = false;
    activitiesPagination.value = { page: 1, lastPage: 1, total: 0 };
    readingsPagination.value = { page: 1, lastPage: 1, total: 0 };
  }

  return {
    // State
    meters,
    selectedMeter,
    activities,
    readings,
    statusCounts,
    isLoading,
    isLoadingMeter,
    isLoadingActivities,
    isLoadingReadings,
    isSubmitting,
    activitiesPagination,
    readingsPagination,

    // Computed
    gasMeters,
    activeMeters,
    hasMeters,

    // Actions
    fetchMeters,
    fetchMeter,
    fetchStatusCounts,
    fetchActivities,
    fetchReadings,
    submitReading,
    clearSelectedMeter,
    $reset,
  };
});
