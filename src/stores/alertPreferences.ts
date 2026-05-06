/**
 * Alert Preferences Store
 * CRUD for per-contact alert notification preferences
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as alertPreferenceService from 'src/services/alertPreference.service';
import type { AlertPreference } from 'src/types/alertPreference.types';

export const useAlertPreferencesStore = defineStore('alertPreferences', () => {
  const preferences = ref<AlertPreference[]>([]);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);

  async function fetchPreferences(entityId: string, contactId: string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      preferences.value = await alertPreferenceService.getContactPreferences(entityId, contactId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load preferences';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function createPreference(
    entityId: string,
    data: Parameters<typeof alertPreferenceService.upsertPreference>[1]
  ): Promise<AlertPreference> {
    isSaving.value = true;
    error.value = null;
    try {
      const created = await alertPreferenceService.upsertPreference(entityId, data);
      const idx = preferences.value.findIndex(p => p.id === created.id);
      if (idx !== -1) {
        preferences.value[idx] = created;
      } else {
        preferences.value.push(created);
      }
      return created;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save preference';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  async function deletePreference(entityId: string, preferenceId: string): Promise<void> {
    isSaving.value = true;
    error.value = null;
    try {
      await alertPreferenceService.deletePreference(entityId, preferenceId);
      preferences.value = preferences.value.filter(p => p.id !== preferenceId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete preference';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }

  function $reset(): void {
    preferences.value = [];
    isLoading.value = false;
    isSaving.value = false;
    error.value = null;
  }

  return {
    preferences,
    isLoading,
    isSaving,
    error,
    fetchPreferences,
    createPreference,
    deletePreference,
    $reset,
  };
});
