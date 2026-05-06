/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('src/boot/axios', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import { useSubscriptionsStore } from './subscriptions';
import { subscriptionService } from 'src/services/subscription.service';

vi.mock('src/services/subscription.service');
const mockedService = vi.mocked(subscriptionService);

const makeSub = (overrides = {}) => ({
  id: 's1',
  status: 'active',
  group: 'natural_gas',
  ...overrides,
});

describe('useSubscriptionsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetchSubscriptions populates subscriptions', async () => {
    const subs = [makeSub()];
    mockedService.getSubscriptions.mockResolvedValueOnce(subs as any);

    const store = useSubscriptionsStore();
    await store.fetchSubscriptions('e1' as any);

    expect(store.subscriptions).toEqual(subs);
    expect(store.isLoading).toBe(false);
  });

  it('activeSubscriptions filters by active status', () => {
    const store = useSubscriptionsStore();
    store.subscriptions = [
      makeSub({ id: 's1', status: 'active' }),
      makeSub({ id: 's2', status: 'suspended' }),
    ] as any;
    expect(store.activeSubscriptions).toHaveLength(1);
  });

  it('subscriptionsByGroup groups correctly', () => {
    const store = useSubscriptionsStore();
    store.subscriptions = [
      makeSub({ id: 's1', group: 'natural_gas' }),
      makeSub({ id: 's2', group: 'water' }),
    ] as any;
    expect(store.subscriptionsByGroup.natural_gas).toHaveLength(1);
    expect(store.subscriptionsByGroup.water).toHaveLength(1);
    expect(store.subscriptionsByGroup.electricity).toHaveLength(0);
  });

  it('setStatusFilter updates filter and filteredSubscriptions', () => {
    const store = useSubscriptionsStore();
    store.subscriptions = [
      makeSub({ id: 's1', status: 'active' }),
      makeSub({ id: 's2', status: 'suspended' }),
    ] as any;
    store.setStatusFilter('suspended' as any);
    expect(store.filteredSubscriptions).toHaveLength(1);
    expect(store.filteredSubscriptions[0]?.id).toBe('s2');
  });

  it('clearFilters resets both filters', () => {
    const store = useSubscriptionsStore();
    store.setStatusFilter('active' as any);
    store.setGroupFilter('water' as any);
    store.clearFilters();
    expect(store.statusFilter).toBeNull();
    expect(store.groupFilter).toBeNull();
  });

  it('fetchSubscription sets currentSubscription', async () => {
    const sub = makeSub({ id: 's99' });
    mockedService.getSubscription.mockResolvedValueOnce(sub as any);

    const store = useSubscriptionsStore();
    await store.fetchSubscription('e1' as any, 's99' as any);

    expect(store.currentSubscription).toEqual(sub);
  });

  it('reset clears all state', async () => {
    mockedService.getSubscriptions.mockResolvedValueOnce([makeSub()] as any);
    const store = useSubscriptionsStore();
    await store.fetchSubscriptions('e1' as any);
    store.reset();
    expect(store.subscriptions).toHaveLength(0);
    expect(store.currentSubscription).toBeNull();
  });
});
