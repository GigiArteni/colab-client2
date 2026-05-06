/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('src/boot/axios', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import { useNotificationsStore } from './notifications';
import { notificationService } from 'src/services/notification.service';

vi.mock('src/services/notification.service');
const mockedService = vi.mocked(notificationService);

const makeNotif = (overrides = {}) => ({
  id: 'n1',
  read_at: null,
  created_at: '2026-05-01T00:00:00Z',
  ...overrides,
});

const makeApiResponse = (data: unknown[], page = 1, lastPage = 1) => ({
  data,
  meta: { pagination: { current_page: page, last_page: lastPage, total: data.length, per_page: 20 } },
});

describe('useNotificationsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetchNotifications populates notifications', async () => {
    const notifs = [makeNotif()];
    mockedService.getNotifications.mockResolvedValueOnce(makeApiResponse(notifs) as any);

    const store = useNotificationsStore();
    await store.fetchNotifications();

    expect(store.notifications).toEqual(notifs);
    expect(store.isLoading).toBe(false);
  });

  it('markAsRead updates read_at and decrements unread summary', async () => {
    mockedService.markAsRead.mockResolvedValueOnce(undefined as any);

    const store = useNotificationsStore();
    store.notifications = [makeNotif({ id: 'n1', read_at: null })] as any;
    store.summary = { total: 1, unread: 1 };

    await store.markAsRead('n1');

    expect(store.notifications[0]?.read_at).toBeTruthy();
    expect(store.summary?.unread).toBe(0);
  });

  it('markAllAsRead sets read_at on all and zeroes unread', async () => {
    mockedService.markAllAsRead.mockResolvedValueOnce(undefined as any);

    const store = useNotificationsStore();
    store.notifications = [
      makeNotif({ id: 'n1', read_at: null }),
      makeNotif({ id: 'n2', read_at: null }),
    ] as any;
    store.summary = { total: 2, unread: 2 };

    await store.markAllAsRead();

    expect(store.notifications.every((n) => n.read_at)).toBe(true);
    expect(store.summary?.unread).toBe(0);
  });

  it('deleteNotification removes notification from list', async () => {
    mockedService.deleteNotification.mockResolvedValueOnce(undefined as any);

    const store = useNotificationsStore();
    store.notifications = [makeNotif({ id: 'n1' })] as any;
    store.summary = { total: 1, unread: 0 };

    await store.deleteNotification('n1');

    expect(store.notifications).toHaveLength(0);
    expect(store.summary?.total).toBe(0);
  });

  it('unreadCount and hasUnread reflect summary', () => {
    const store = useNotificationsStore();
    store.summary = { total: 5, unread: 3 };

    expect(store.unreadCount).toBe(3);
    expect(store.hasUnread).toBe(true);
  });

  it('filteredNotifications returns unread only when showUnreadOnly is set', () => {
    const store = useNotificationsStore();
    store.notifications = [
      makeNotif({ id: 'n1', read_at: null }),
      makeNotif({ id: 'n2', read_at: '2026-05-01' }),
    ] as any;
    store.setShowUnreadOnly(true);

    expect(store.filteredNotifications).toHaveLength(1);
    expect(store.filteredNotifications[0]?.id).toBe('n1');
  });

  it('fetchSummary populates summary', async () => {
    mockedService.getSummary.mockResolvedValueOnce({ total: 10, unread: 4 } as any);

    const store = useNotificationsStore();
    await store.fetchSummary();

    expect(store.unreadCount).toBe(4);
    expect(store.hasUnread).toBe(true);
  });

  it('fetchSummary falls back to local count on error', async () => {
    mockedService.getSummary.mockRejectedValueOnce(new Error('fail'));

    const store = useNotificationsStore();
    store.notifications = [
      makeNotif({ id: 'n1', read_at: null }),
      makeNotif({ id: 'n2', read_at: '2026-05-01' }),
    ] as any;
    await store.fetchSummary();

    expect(store.summary?.unread).toBe(1);
    expect(store.summary?.total).toBe(2);
  });

  it('markAllAsRead throws if service fails', async () => {
    mockedService.markAllAsRead.mockRejectedValueOnce(new Error('network'));

    const store = useNotificationsStore();
    store.notifications = [makeNotif()] as any;
    store.summary = { total: 1, unread: 1 };

    await expect(store.markAllAsRead()).rejects.toThrow('network');
  });

  it('deleteNotification throws if service fails', async () => {
    mockedService.deleteNotification.mockRejectedValueOnce(new Error('gone'));

    const store = useNotificationsStore();
    store.notifications = [makeNotif({ id: 'n1' })] as any;

    await expect(store.deleteNotification('n1')).rejects.toThrow('gone');
    expect(store.notifications).toHaveLength(1);
  });

  it('loadMore appends notifications when hasMore is true', async () => {
    const page1 = [makeNotif({ id: 'n1' })];
    const page2 = [makeNotif({ id: 'n2' })];
    mockedService.getNotifications
      .mockResolvedValueOnce(makeApiResponse(page1, 1, 2) as any)
      .mockResolvedValueOnce(makeApiResponse(page2, 2, 2) as any);

    const store = useNotificationsStore();
    await store.fetchNotifications();
    await store.loadMore();

    expect(store.notifications).toHaveLength(2);
    expect(store.notifications[1]?.id).toBe('n2');
  });

  it('loadMore does nothing when no more pages', async () => {
    mockedService.getNotifications.mockResolvedValueOnce(makeApiResponse([makeNotif()], 1, 1) as any);

    const store = useNotificationsStore();
    await store.fetchNotifications();
    await store.loadMore();

    expect(mockedService.getNotifications).toHaveBeenCalledTimes(1);
  });

  it('hasMore is false when pagination is null', () => {
    const store = useNotificationsStore();
    expect(store.hasMore).toBe(false);
  });

  it('deleteNotification decrements unread when notification was unread', async () => {
    mockedService.deleteNotification.mockResolvedValueOnce(undefined as any);

    const store = useNotificationsStore();
    store.notifications = [makeNotif({ id: 'n1', read_at: null })] as any;
    store.summary = { total: 1, unread: 1 };

    await store.deleteNotification('n1');

    expect(store.summary?.unread).toBe(0);
  });

  it('fetchNotifications throws and sets error on failure', async () => {
    mockedService.getNotifications.mockRejectedValueOnce(new Error('server error'));

    const store = useNotificationsStore();
    await expect(store.fetchNotifications()).rejects.toThrow('server error');
    expect(store.error).toBe('server error');
    expect(store.isLoading).toBe(false);
  });

  it('reset clears all state', async () => {
    mockedService.getNotifications.mockResolvedValueOnce(makeApiResponse([makeNotif()]) as any);
    const store = useNotificationsStore();
    await store.fetchNotifications();
    store.reset();
    expect(store.notifications).toHaveLength(0);
    expect(store.summary).toBeNull();
  });
});
