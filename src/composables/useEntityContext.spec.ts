import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEntityContext } from './useEntityContext';
import { useEntityStore } from 'src/stores/entity';

vi.mock('src/services/entity.service', () => ({
  entityService: {
    getEntities: vi.fn().mockResolvedValue([]),
  },
}));

// Quasar LocalStorage shim
vi.mock('quasar', () => ({
  LocalStorage: {
    getItem: vi.fn(() => null),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('useEntityContext', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('exposes currentEntity as null when nothing selected', () => {
    const { currentEntity, currentEntityId } = useEntityContext();
    expect(currentEntity.value).toBeNull();
    expect(currentEntityId.value).toBeNull();
  });

  it('setEntity persists selection through the store', () => {
    const { setEntity, currentEntityId } = useEntityContext();
    const store = useEntityStore();
    // Pre-populate entities so selectEntity can find the ID
    store.entities = [{ id: 'abc123', name: 'Test Entity' }] as never;
    setEntity('abc123');
    expect(currentEntityId.value).toBe('abc123');
  });

  it('clearEntity resets selection', () => {
    const { setEntity, clearEntity, currentEntityId } = useEntityContext();
    const store = useEntityStore();
    store.entities = [{ id: 'abc123', name: 'Test Entity' }] as never;
    setEntity('abc123');
    clearEntity();
    expect(currentEntityId.value).toBeNull();
  });

  it('hasMultipleEntities is false with one entity', () => {
    const store = useEntityStore();
    store.entities = [{ id: 'a', name: 'A' }] as never;
    const { hasMultipleEntities } = useEntityContext();
    expect(hasMultipleEntities.value).toBe(false);
  });

  it('hasMultipleEntities is true with two entities', () => {
    const store = useEntityStore();
    store.entities = [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ] as never;
    const { hasMultipleEntities } = useEntityContext();
    expect(hasMultipleEntities.value).toBe(true);
  });
});
