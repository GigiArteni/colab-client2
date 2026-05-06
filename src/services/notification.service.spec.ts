/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();
const post = vi.fn();
const del = vi.fn();

// notification.service imports `api` as default from './api'
vi.mock('src/services/api', () => ({
  default: {
    get: (url: string, opts?: unknown) => get(url, opts),
    post: (url: string, body?: unknown) => post(url, body),
    delete: (url: string) => del(url),
  },
}));

// api.ts imports from pinia — stub auth store to avoid bootstrap
vi.mock('src/stores/auth', () => ({
  useAuthStore: () => ({ accessToken: null, refreshAccessToken: vi.fn(), logout: vi.fn() }),
}));

import { notificationService } from './notification.service';

describe('notificationService', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    del.mockReset();
  });

  it('getNotifications calls /notifications with default sort', async () => {
    get.mockResolvedValueOnce({ data: { data: [], meta: {} } });

    await notificationService.getNotifications();

    expect(get.mock.calls[0]![0]).toBe('/notifications');
    const opts = get.mock.calls[0]![1];
    expect(opts.params.sort).toBe('-created_at');
  });

  it('getNotifications passes extra params through', async () => {
    get.mockResolvedValueOnce({ data: { data: [], meta: {} } });

    await notificationService.getNotifications({ page: 2 } as any);

    const opts = get.mock.calls[0]![1];
    expect(opts.params.page).toBe(2);
  });

  it('getNotification calls detail endpoint', async () => {
    const notif = { id: 'n1' };
    get.mockResolvedValueOnce({ data: { data: notif } });

    const result = await notificationService.getNotification('n1');

    expect(get.mock.calls[0]![0]).toBe('/notifications/n1');
    expect(result).toEqual(notif);
  });

  it('markAsRead posts to read endpoint', async () => {
    post.mockResolvedValueOnce({});

    await notificationService.markAsRead('n1');

    expect(post.mock.calls[0]![0]).toBe('/notifications/n1/read');
  });

  it('markAllAsRead posts to read-all endpoint', async () => {
    post.mockResolvedValueOnce({});

    await notificationService.markAllAsRead();

    expect(post.mock.calls[0]![0]).toBe('/notifications/read-all');
  });

  it('getSummary returns summary data', async () => {
    const summary = { total: 10, unread: 3 };
    get.mockResolvedValueOnce({ data: { data: summary } });

    const result = await notificationService.getSummary();

    expect(get.mock.calls[0]![0]).toBe('/notifications/summary');
    expect(result).toEqual(summary);
  });

  it('deleteNotification calls delete endpoint', async () => {
    del.mockResolvedValueOnce({});

    await notificationService.deleteNotification('n1');

    expect(del.mock.calls[0]![0]).toBe('/notifications/n1');
  });
});
