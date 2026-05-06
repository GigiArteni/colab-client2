/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('src/boot/axios', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock('quasar', () => ({
  LocalStorage: {
    getItem: vi.fn(() => null),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

import { useEntityStore } from './entity';
import { entityService } from 'src/services/entity.service';

vi.mock('src/services/entity.service');
const mockedService = vi.mocked(entityService);

describe('useEntityStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('initial state is empty', () => {
    const store = useEntityStore();
    expect(store.entities).toEqual([]);
    expect(store.selectedEntityId).toBeNull();
    expect(store.isLoaded).toBe(false);
  });

  it('fetchEntities populates entities and auto-selects single entity', async () => {
    const entities = [{ id: 'e1', name: 'Only One' }];
    mockedService.getEntities.mockResolvedValueOnce(entities as any);

    const store = useEntityStore();
    await store.fetchEntities();

    expect(store.entities).toEqual(entities);
    expect(store.isLoaded).toBe(true);
    expect(store.selectedEntityId).toBe('e1');
  });

  it('fetchEntities selects first entity when multiple', async () => {
    const entities = [{ id: 'e1' }, { id: 'e2' }];
    mockedService.getEntities.mockResolvedValueOnce(entities as any);

    const store = useEntityStore();
    await store.fetchEntities();

    expect(store.selectedEntityId).toBe('e1');
    expect(store.hasMultipleEntities).toBe(true);
  });

  it('selectEntity updates selectedEntityId', () => {
    const store = useEntityStore();
    store.entities = [{ id: 'e1' }, { id: 'e2' }] as any;
    store.selectEntity('e2');
    expect(store.selectedEntityId).toBe('e2');
    expect(store.selectedEntity?.id).toBe('e2');
  });

  it('clearSelection resets selection', () => {
    const store = useEntityStore();
    store.entities = [{ id: 'e1' }] as any;
    store.selectEntity('e1');
    store.clearSelection();
    expect(store.selectedEntityId).toBeNull();
    expect(store.selectedEntity).toBeNull();
  });

  it('$reset clears all state', async () => {
    mockedService.getEntities.mockResolvedValueOnce([{ id: 'e1' }] as any);
    const store = useEntityStore();
    await store.fetchEntities();
    store.$reset();
    expect(store.entities).toEqual([]);
    expect(store.selectedEntityId).toBeNull();
    expect(store.isLoaded).toBe(false);
  });
});
