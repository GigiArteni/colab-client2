/**
 * useEntityContext
 * Reactive wrapper around entity selection. Delegates to entityStore but provides
 * a composable API for components that only need the current entity without
 * importing the full store.
 */

import { computed, type ComputedRef } from 'vue';
import { useEntityStore } from 'src/stores/entity';
import type { Entity } from 'src/types';

export interface UseEntityContextReturn {
  /** Currently selected entity object, or null */
  currentEntity: ComputedRef<Entity | null>;
  /** Hashed ID of the currently selected entity, or null */
  currentEntityId: ComputedRef<string | null>;
  /** Whether the entity list is still loading */
  isLoading: ComputedRef<boolean>;
  /** Whether entities have been fetched at least once */
  isLoaded: ComputedRef<boolean>;
  /** Whether the user has more than one entity */
  hasMultipleEntities: ComputedRef<boolean>;
  /** Select an entity by hashed_id and persist to localStorage */
  setEntity: (id: string) => void;
  /** Clear the current entity selection */
  clearEntity: () => void;
  /** Fetch entities (no-op if already loading) */
  fetchEntities: () => Promise<void>;
}

/**
 * Provides reactive access to the current entity context.
 * Auto-selects when the user has only one entity.
 * Persists selection across page reloads via localStorage (handled in entityStore).
 */
export function useEntityContext(): UseEntityContextReturn {
  const store = useEntityStore();

  const currentEntity = computed<Entity | null>(() => store.selectedEntity);
  const currentEntityId = computed<string | null>(() => store.selectedEntityId);
  const isLoading = computed(() => store.isLoading);
  const isLoaded = computed(() => store.isLoaded);
  const hasMultipleEntities = computed(() => store.hasMultipleEntities);

  function setEntity(id: string): void {
    store.selectEntity(id);
  }

  function clearEntity(): void {
    store.clearSelection();
  }

  async function fetchEntities(): Promise<void> {
    await store.fetchEntities();
  }

  return {
    currentEntity,
    currentEntityId,
    isLoading,
    isLoaded,
    hasMultipleEntities,
    setEntity,
    clearEntity,
    fetchEntities,
  };
}
