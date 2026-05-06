import { describe, it, expect, vi, beforeEach } from 'vitest';

// @capacitor/core is not installed in dev — mock at module level before any imports
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
    getPlatform: vi.fn(() => 'web'),
  },
}));

vi.mock('src/services/profile.service', () => ({
  profileService: {
    registerDeviceToken: vi.fn(),
    unregisterDeviceToken: vi.fn(),
  },
}));

import { pushNotificationsService } from './push-notifications.service';

describe('pushNotificationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('isSupported returns false on web platform', () => {
    expect(pushNotificationsService.isSupported()).toBe(false);
  });

  it('getPlatform returns web', () => {
    expect(pushNotificationsService.getPlatform()).toBe('web');
  });

  it('initialize returns false when not native', async () => {
    const result = await pushNotificationsService.initialize();
    expect(result).toBe(false);
  });

  it('checkPermissions returns denied on web', async () => {
    const result = await pushNotificationsService.checkPermissions();
    expect(result).toBe('denied');
  });

  it('getDeliveredNotifications returns empty array on web', async () => {
    const result = await pushNotificationsService.getDeliveredNotifications();
    expect(result).toEqual([]);
  });

  it('unregister is a no-op when not native', async () => {
    await expect(pushNotificationsService.unregister()).resolves.toBeUndefined();
  });

  it('onNotificationReceived registers handler and returns unsubscribe fn', () => {
    const handler = vi.fn();
    const unsub = pushNotificationsService.onNotificationReceived(handler);
    expect(typeof unsub).toBe('function');
    unsub();
  });

  it('onNotificationAction registers handler and returns unsubscribe fn', () => {
    const handler = vi.fn();
    const unsub = pushNotificationsService.onNotificationAction(handler);
    expect(typeof unsub).toBe('function');
    unsub();
  });

  it('getDeviceToken returns null initially', () => {
    expect(pushNotificationsService.getDeviceToken()).toBeNull();
  });
});
