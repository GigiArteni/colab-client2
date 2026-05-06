/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// happy-dom provides window.Notification — stub it
const mockRequestPermission = vi.fn();
const mockNotificationFn = vi.fn().mockImplementation(() => ({
  onclick: null,
  close: vi.fn(),
}));
const mockNotification = mockNotificationFn as any;
mockNotification.permission = 'default';
mockNotification.requestPermission = mockRequestPermission;

Object.defineProperty(window, 'Notification', {
  writable: true,
  value: mockNotification,
});

import { useBrowserNotifications } from './useBrowserNotifications';

describe('useBrowserNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockNotification.permission = 'default';
    mockRequestPermission.mockReset();
  });

  it('isSupported is true when Notification is in window', () => {
    const { isSupported } = useBrowserNotifications();
    expect(isSupported.value).toBe(true);
  });

  it('isAvailable is false when permission is not granted', () => {
    const { isAvailable } = useBrowserNotifications();
    expect(isAvailable.value).toBe(false);
  });

  it('requestPermission returns true when granted', async () => {
    mockRequestPermission.mockResolvedValueOnce('granted');
    const { requestPermission, permission } = useBrowserNotifications();

    const result = await requestPermission();

    expect(result).toBe(true);
    expect(permission.value).toBe('granted');
    expect(localStorage.getItem('colab_notifications_enabled')).toBe('true');
  });

  it('requestPermission returns false when denied', async () => {
    mockRequestPermission.mockResolvedValueOnce('denied');
    const { requestPermission } = useBrowserNotifications();

    const result = await requestPermission();

    expect(result).toBe(false);
  });

  it('enable sets isEnabled when permission is granted', () => {
    mockNotification.permission = 'granted';
    const { enable, isEnabled } = useBrowserNotifications();

    enable();

    expect(isEnabled.value).toBe(true);
    expect(localStorage.getItem('colab_notifications_enabled')).toBe('true');
  });

  it('disable sets isEnabled to false', () => {
    const { disable, isEnabled } = useBrowserNotifications();

    disable();

    expect(isEnabled.value).toBe(false);
    expect(localStorage.getItem('colab_notifications_enabled')).toBe('false');
  });

  it('showNotification returns null when not available', () => {
    const { showNotification } = useBrowserNotifications();
    const result = showNotification({ id: 'a1', subject: 'Test', content_rendered: '<p>Hello</p>' } as any);
    expect(result).toBeNull();
  });

  it('showSimpleNotification returns null when not available', () => {
    const { showSimpleNotification } = useBrowserNotifications();
    const result = showSimpleNotification('Title', 'Body');
    expect(result).toBeNull();
  });
});
