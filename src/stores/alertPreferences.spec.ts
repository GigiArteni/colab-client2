import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('src/boot/axios', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock('src/composables/useTenant', () => ({
  useTenant: () => ({ slug: { value: 'test' } }),
}));

import { useAlertPreferencesStore } from './alertPreferences';
import * as alertPreferenceService from 'src/services/alertPreference.service';

vi.mock('src/services/alertPreference.service');

const mockedService = vi.mocked(alertPreferenceService);

describe('useAlertPreferencesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetchPreferences populates preferences', async () => {
    const prefs = [{ id: 'p1', entity_id: 'e1', alert_type_id: 't1', preferenceable_type: 'Contact', preferenceable_id: 'c1', email_enabled: true, sms_enabled: false, whatsapp_enabled: false, print_enabled: false, in_app_enabled: true, opted_out: false }];
    mockedService.getContactPreferences.mockResolvedValueOnce(prefs);

    const store = useAlertPreferencesStore();
    await store.fetchPreferences('e1', 'c1');

    expect(store.preferences).toEqual(prefs);
    expect(store.isLoading).toBe(false);
  });

  it('createPreference appends new preference', async () => {
    const pref = { id: 'p2', entity_id: 'e1', alert_type_id: 't2', preferenceable_type: 'Contact', preferenceable_id: 'c1', email_enabled: true, sms_enabled: false, whatsapp_enabled: false, print_enabled: false, in_app_enabled: true, opted_out: false };
    mockedService.upsertPreference.mockResolvedValueOnce(pref);

    const store = useAlertPreferencesStore();
    const result = await store.createPreference('e1', { alert_type_id: 't2', preferenceable_type: 'Contact', preferenceable_id: 'c1' });

    expect(result).toEqual(pref);
    expect(store.preferences).toContainEqual(pref);
  });

  it('deletePreference removes preference from list', async () => {
    mockedService.deletePreference.mockResolvedValueOnce(undefined);

    const store = useAlertPreferencesStore();
    store.preferences = [{ id: 'p1', entity_id: 'e1', alert_type_id: 't1', preferenceable_type: 'Contact', preferenceable_id: 'c1', email_enabled: true, sms_enabled: false, whatsapp_enabled: false, print_enabled: false, in_app_enabled: true, opted_out: false }];

    await store.deletePreference('e1', 'p1');

    expect(store.preferences).toHaveLength(0);
  });

  it('$reset clears all state', () => {
    const store = useAlertPreferencesStore();
    store.preferences = [{ id: 'p1', entity_id: 'e1', alert_type_id: 't1', preferenceable_type: 'Contact', preferenceable_id: 'c1', email_enabled: true, sms_enabled: false, whatsapp_enabled: false, print_enabled: false, in_app_enabled: true, opted_out: false }];
    store.$reset();
    expect(store.preferences).toHaveLength(0);
  });
});
