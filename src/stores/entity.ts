/**
 * Entity Store
 * Manages customer's entities (utility companies/suppliers)
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { LocalStorage } from 'quasar';
import { entityService } from 'src/services/entity.service';
import type { Entity } from 'src/types';

const SELECTED_ENTITY_KEY = 'selected_entity_hashed_id';

export const useEntityStore = defineStore('entity', () => {
  // State
  const entities = ref<Entity[]>([]);
  // Store hashed_id for API calls
  const selectedEntityId = ref<string | null>(
    LocalStorage.getItem<string>(SELECTED_ENTITY_KEY) || null
  );
  const isLoading = ref(false);
  const isLoaded = ref(false);

  // Computed
  const selectedEntity = computed<Entity | null>(() => {
    if (!selectedEntityId.value) return null;
    return entities.value.find((e) => e.id === selectedEntityId.value) || null;
  });

  const hasMultipleEntities = computed(() => entities.value.length > 1);

  /**
   * Fetch entities for current user
   */
  async function fetchEntities(): Promise<void> {
    if (isLoading.value) return;

    isLoading.value = true;

    try {
      entities.value = await entityService.getEntities();
      isLoaded.value = true;

      // Auto-select if only one entity or restore saved selection
      if (entities.value.length === 1 && entities.value[0]) {
        selectEntity(entities.value[0].id);
      } else if (selectedEntityId.value) {
        // Verify saved selection is still valid
        const exists = entities.value.some((e) => e.id === selectedEntityId.value);
        if (!exists && entities.value.length > 0 && entities.value[0]) {
          selectEntity(entities.value[0].id);
        }
      } else if (entities.value.length > 0 && entities.value[0]) {
        // Select first entity by default
        selectEntity(entities.value[0].id);
      }
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Select an entity by hashed_id
   */
  function selectEntity(hashedId: string): void {
    selectedEntityId.value = hashedId;
    LocalStorage.set(SELECTED_ENTITY_KEY, hashedId);
  }

  /**
   * Clear selection
   */
  function clearSelection(): void {
    selectedEntityId.value = null;
    LocalStorage.remove(SELECTED_ENTITY_KEY);
  }

  /**
   * Reset store state
   */
  function $reset(): void {
    entities.value = [];
    selectedEntityId.value = null;
    isLoaded.value = false;
    isLoading.value = false;
    LocalStorage.remove(SELECTED_ENTITY_KEY);
  }

  return {
    // State
    entities,
    selectedEntityId,
    isLoading,
    isLoaded,

    // Computed
    selectedEntity,
    hasMultipleEntities,

    // Actions
    fetchEntities,
    selectEntity,
    clearSelection,
    $reset,
  };
});
