/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('src/boot/axios', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock('quasar', () => ({
  LocalStorage: { getItem: vi.fn(() => null), set: vi.fn(), remove: vi.fn() },
}));

vi.mock('src/composables/useTenant', () => ({
  useTenant: () => ({ slug: { value: 'acme' } }),
}));

vi.mock('src/services/auth.service');
vi.mock('src/services/mfa.service');

const mockSubscribe = vi.fn();
const mockUnsubscribe = vi.fn();
const mockIsConnected = { value: false };

vi.mock('src/composables/useEcho', () => ({
  useEcho: () => ({
    subscribe: mockSubscribe,
    unsubscribe: mockUnsubscribe,
    isConnected: mockIsConnected,
  }),
}));

vi.mock('src/composables/useBrowserNotifications', () => ({
  useBrowserNotifications: () => ({
    isAvailable: { value: false },
    showNotification: vi.fn(),
  }),
}));

import { useAlertsStore } from './alerts';
import { useProfileStore } from './profile';
import { useEntityStore } from './entity';
import { alertService } from 'src/services';

vi.mock('src/services', () => ({
  alertService: {
    getAlerts: vi.fn(),
    dismissAlert: vi.fn(),
    bulkDismissAlerts: vi.fn(),
  },
}));

const mockedAlertService = vi.mocked(alertService);

const makeAlert = (overrides = {}) => ({
  id: 'a1',
  dismissed_at: null,
  status: 'pending',
  ...overrides,
});

const makePaginatedResponse = (data: unknown[]) => ({
  data,
  meta: { current_page: 1, last_page: 1, total: data.length },
});

describe('useAlertsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockIsConnected.value = false;
  });

  it('fetchAlerts does nothing without entity/contact', async () => {
    // profile and entity stores have no data by default
    const store = useAlertsStore();
    await store.fetchAlerts();
    expect(mockedAlertService.getAlerts).not.toHaveBeenCalled();
  });

  it('unreadAlerts and unreadCount reflect non-dismissed alerts', () => {
    const store = useAlertsStore();
    store.alerts = [
      makeAlert({ id: 'a1', dismissed_at: null }),
      makeAlert({ id: 'a2', dismissed_at: '2026-05-01' }),
    ] as any;

    expect(store.unreadAlerts).toHaveLength(1);
    expect(store.unreadCount).toBe(1);
  });

  it('hasMore is true when currentPage < totalPages', () => {
    const store = useAlertsStore();
    store.currentPage = 1;
    store.totalPages = 3;
    expect(store.hasMore).toBe(true);
  });

  it('hasMore is false when on last page', () => {
    const store = useAlertsStore();
    store.currentPage = 2;
    store.totalPages = 2;
    expect(store.hasMore).toBe(false);
  });

  it('prependAlert adds alert to front and increments total', () => {
    const store = useAlertsStore();
    store.alerts = [makeAlert({ id: 'a1' })] as any;
    store.totalAlerts = 1;

    store.prependAlert(makeAlert({ id: 'a2' }) as any);

    expect(store.alerts[0]?.id).toBe('a2');
    expect(store.totalAlerts).toBe(2);
  });

  it('updateAlert patches existing alert', () => {
    const store = useAlertsStore();
    store.alerts = [makeAlert({ id: 'a1', status: 'pending' })] as any;

    store.updateAlert('a1', { status: 'sent' });

    expect(store.alerts[0]?.status).toBe('sent');
  });

  it('removeAlert removes by id and decrements total', () => {
    const store = useAlertsStore();
    store.alerts = [makeAlert({ id: 'a1' }), makeAlert({ id: 'a2' })] as any;
    store.totalAlerts = 2;

    store.removeAlert('a1');

    expect(store.alerts).toHaveLength(1);
    expect(store.alerts[0]?.id).toBe('a2');
    expect(store.totalAlerts).toBe(1);
  });

  it('$reset clears alerts and loading state', () => {
    const store = useAlertsStore();
    store.alerts = [makeAlert()] as any;
    store.totalAlerts = 5;
    store.$reset();

    expect(store.alerts).toHaveLength(0);
    expect(store.totalAlerts).toBe(0);
    expect(store.isLoaded).toBe(false);
  });

  it('fetchAlerts populates alerts when entity and contact are set', async () => {
    const alerts = [makeAlert({ id: 'a1' }), makeAlert({ id: 'a2' })];
    mockedAlertService.getAlerts.mockResolvedValueOnce(makePaginatedResponse(alerts) as any);

    const store = useAlertsStore();
    const entityStore = useEntityStore();
    const profileStore = useProfileStore();

    entityStore.selectedEntityId = 'e1';
    profileStore.user = { contact: { id: 'c1' } } as any;

    await store.fetchAlerts();

    expect(mockedAlertService.getAlerts).toHaveBeenCalledWith('e1', 'c1', expect.any(Object));
    expect(store.alerts).toHaveLength(2);
    expect(store.isLoaded).toBe(true);
    expect(store.isLoading).toBe(false);
  });

  it('dismissAlert does optimistic update and calls service', async () => {
    mockedAlertService.dismissAlert.mockResolvedValueOnce(undefined as any);

    const store = useAlertsStore();
    const entityStore = useEntityStore();
    const profileStore = useProfileStore();

    entityStore.selectedEntityId = 'e1';
    profileStore.user = { contact: { id: 'c1' } } as any;
    store.alerts = [makeAlert({ id: 'a1', dismissed_at: null })] as any;

    const result = await store.dismissAlert('a1');

    expect(result).toBe(true);
    expect(store.alerts[0]?.dismissed_at).toBeTruthy();
  });

  it('dismissAlert rolls back on service error', async () => {
    mockedAlertService.dismissAlert.mockRejectedValueOnce(new Error('network error'));

    const store = useAlertsStore();
    const entityStore = useEntityStore();
    const profileStore = useProfileStore();

    entityStore.selectedEntityId = 'e1';
    profileStore.user = { contact: { id: 'c1' } } as any;
    store.alerts = [makeAlert({ id: 'a1', dismissed_at: null })] as any;

    const result = await store.dismissAlert('a1');

    expect(result).toBe(false);
    expect(store.alerts[0]?.dismissed_at).toBeNull();
  });

  it('bulkDismissAlerts returns success/failed and updates local state', async () => {
    mockedAlertService.bulkDismissAlerts.mockResolvedValueOnce({
      success: ['a1', 'a2'],
      failed: [],
    } as any);

    const store = useAlertsStore();
    const entityStore = useEntityStore();
    const profileStore = useProfileStore();

    entityStore.selectedEntityId = 'e1';
    profileStore.user = { contact: { id: 'c1' } } as any;
    store.alerts = [
      makeAlert({ id: 'a1', dismissed_at: null }),
      makeAlert({ id: 'a2', dismissed_at: null }),
    ] as any;

    const result = await store.bulkDismissAlerts(['a1', 'a2']);

    expect(result.success).toEqual(['a1', 'a2']);
    expect(result.failed).toEqual([]);
    expect(store.alerts[0]?.dismissed_at).toBeTruthy();
    expect(store.alerts[1]?.dismissed_at).toBeTruthy();
  });

  it('loadMore appends alerts when hasMore is true', async () => {
    const page1 = [makeAlert({ id: 'a1' })];
    const page2 = [makeAlert({ id: 'a2' })];
    mockedAlertService.getAlerts
      .mockResolvedValueOnce({ data: page1, meta: { current_page: 1, last_page: 2, total: 2 } } as any)
      .mockResolvedValueOnce({ data: page2, meta: { current_page: 2, last_page: 2, total: 2 } } as any);

    const store = useAlertsStore();
    const entityStore = useEntityStore();
    const profileStore = useProfileStore();
    entityStore.selectedEntityId = 'e1';
    profileStore.user = { contact: { id: 'c1' } } as any;

    await store.fetchAlerts();
    await store.loadMore();

    expect(store.alerts).toHaveLength(2);
    expect(store.currentPage).toBe(2);
  });

  it('loadMore does nothing when already on last page', async () => {
    mockedAlertService.getAlerts.mockResolvedValueOnce({
      data: [makeAlert()],
      meta: { current_page: 1, last_page: 1, total: 1 },
    } as any);

    const store = useAlertsStore();
    const entityStore = useEntityStore();
    const profileStore = useProfileStore();
    entityStore.selectedEntityId = 'e1';
    profileStore.user = { contact: { id: 'c1' } } as any;

    await store.fetchAlerts();
    await store.loadMore();

    expect(mockedAlertService.getAlerts).toHaveBeenCalledTimes(1);
  });

  it('bulkDismissAlerts returns failed when no entity/contact', async () => {
    const store = useAlertsStore();
    const result = await store.bulkDismissAlerts(['a1', 'a2']);
    expect(result.success).toEqual([]);
    expect(result.failed).toEqual(['a1', 'a2']);
  });

  it('bulkDismissAlerts returns failed on service error', async () => {
    mockedAlertService.bulkDismissAlerts.mockRejectedValueOnce(new Error('fail'));

    const store = useAlertsStore();
    const entityStore = useEntityStore();
    const profileStore = useProfileStore();
    entityStore.selectedEntityId = 'e1';
    profileStore.user = { contact: { id: 'c1' } } as any;
    store.alerts = [makeAlert({ id: 'a1' })] as any;

    const result = await store.bulkDismissAlerts(['a1']);
    expect(result.success).toEqual([]);
    expect(result.failed).toEqual(['a1']);
  });

  it('subscribeToAlerts does nothing when echo not connected', () => {
    mockIsConnected.value = false;

    const store = useAlertsStore();
    const profileStore = useProfileStore();
    profileStore.user = { contact: { id: 'c1' } } as any;

    store.subscribeToAlerts();

    expect(mockSubscribe).not.toHaveBeenCalled();
    expect(store.isSubscribed).toBe(false);
  });

  it('subscribeToAlerts subscribes when connected', () => {
    mockIsConnected.value = true;

    const store = useAlertsStore();
    const profileStore = useProfileStore();
    profileStore.user = { contact: { id: 'c1' } } as any;

    store.subscribeToAlerts();

    expect(mockSubscribe).toHaveBeenCalled();
    expect(store.isSubscribed).toBe(true);
  });

  it('subscribeToAlerts is idempotent', () => {
    mockIsConnected.value = true;

    const store = useAlertsStore();
    const profileStore = useProfileStore();
    profileStore.user = { contact: { id: 'c1' } } as any;

    store.subscribeToAlerts();
    store.subscribeToAlerts();

    expect(mockSubscribe).toHaveBeenCalledTimes(3); // 3 events on first call
  });

  it('subscribeToAlerts does nothing without contact', () => {
    mockIsConnected.value = true;

    const store = useAlertsStore();

    store.subscribeToAlerts();

    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  it('unsubscribeFromAlerts calls unsubscribe and resets state', () => {
    mockIsConnected.value = true;

    const store = useAlertsStore();
    const profileStore = useProfileStore();
    profileStore.user = { contact: { id: 'c1' } } as any;

    store.subscribeToAlerts();
    expect(store.isSubscribed).toBe(true);

    store.unsubscribeFromAlerts();

    expect(mockUnsubscribe).toHaveBeenCalled();
    expect(store.isSubscribed).toBe(false);
  });

  it('unsubscribeFromAlerts does nothing when not subscribed', () => {
    const store = useAlertsStore();
    store.unsubscribeFromAlerts();
    expect(mockUnsubscribe).not.toHaveBeenCalled();
  });

  it('dismissAllUnread calls bulkDismissAlerts for all unread', async () => {
    mockedAlertService.bulkDismissAlerts.mockResolvedValueOnce({
      success: ['a1'],
      failed: [],
    } as any);

    const store = useAlertsStore();
    const entityStore = useEntityStore();
    const profileStore = useProfileStore();

    entityStore.selectedEntityId = 'e1';
    profileStore.user = { contact: { id: 'c1' } } as any;
    store.alerts = [makeAlert({ id: 'a1', dismissed_at: null })] as any;

    await store.dismissAllUnread();

    expect(mockedAlertService.bulkDismissAlerts).toHaveBeenCalledWith('e1', 'c1', ['a1']);
  });
});
