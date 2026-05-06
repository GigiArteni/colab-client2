import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('src/boot/axios', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock('quasar', () => ({
  LocalStorage: { getItem: vi.fn(() => null), set: vi.fn(), remove: vi.fn() },
}));

vi.mock('src/composables/useTenant', () => ({
  useTenant: () => ({ slug: { value: 'acme' } }),
}));

vi.mock('src/services/alert.service');

import * as alertService from 'src/services/alert.service';
import { useContextAlerts } from './useContextAlerts';

const mockedAlertService = vi.mocked(alertService);

describe('useContextAlerts', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('initializes with empty alerts and not loading', () => {
    const ctx = useContextAlerts({
      resourceType: 'subscriptions',
      resourceId: 's1',
      autoLoad: false,
    });

    expect(ctx.alerts.value).toEqual([]);
    expect(ctx.loading.value).toBe(false);
    expect(ctx.error.value).toBeNull();
  });

  it('accepts function resourceId', () => {
    const ctx = useContextAlerts({
      resourceType: 'invoices',
      resourceId: () => 'inv1',
      autoLoad: false,
    });

    expect(ctx.alerts.value).toEqual([]);
  });

  it('loadAlerts does nothing without entity or contact', async () => {
    const ctx = useContextAlerts({
      resourceType: 'subscriptions',
      resourceId: 's1',
      autoLoad: false,
    });

    await ctx.loadAlerts();

    expect(mockedAlertService.getAlerts).not.toHaveBeenCalled();
  });

  it('dismissAlert is callable and handles missing entity gracefully', async () => {
    const ctx = useContextAlerts({
      resourceType: 'subscriptions',
      resourceId: 's1',
      autoLoad: false,
    });

    // Without entity/contact set, dismissAlert should return false gracefully
    const result = await ctx.dismissAlert('a1');
    expect(result).toBe(false);
  });

  it('dismissAll is callable', async () => {
    const ctx = useContextAlerts({
      resourceType: 'subscriptions',
      resourceId: 's1',
      autoLoad: false,
    });

    // dismissAll with no unread alerts should no-op
    await expect(ctx.dismissAll()).resolves.toBeUndefined();
  });

  it('refresh calls loadAlerts', async () => {
    const ctx = useContextAlerts({
      resourceType: 'subscriptions',
      resourceId: 's1',
      autoLoad: false,
    });

    await ctx.refresh();
    // Without entity/contact, should not call service
    expect(mockedAlertService.getAlerts).not.toHaveBeenCalled();
  });
});
