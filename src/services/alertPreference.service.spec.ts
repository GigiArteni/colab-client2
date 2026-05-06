import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();
const post = vi.fn();
const put = vi.fn();
const del = vi.fn();

vi.mock('boot/axios', () => ({
  api: {
    get: (url: string, opts?: unknown) => get(url, opts),
    post: (url: string, body?: unknown) => post(url, body),
    put: (url: string, body?: unknown) => put(url, body),
    delete: (url: string) => del(url),
  },
}));

import * as alertPreferenceService from './alertPreference.service';

const E = 'e1';
const C = 'c1';
const P = 'p1';

describe('alertPreferenceService', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    put.mockReset();
    del.mockReset();
  });

  it('getAlertTypes returns static list without making an API call', () => {
    const types = alertPreferenceService.getAlertTypes();
    expect(get).not.toHaveBeenCalled();
    expect(Array.isArray(types)).toBe(true);
    expect(types.length).toBeGreaterThan(0);
    expect(types[0]).toHaveProperty('code');
    expect(types[0]).toHaveProperty('category');
  });

  it('getContactPreferences calls contact endpoint', async () => {
    get.mockResolvedValueOnce({ data: { data: [] } });
    await alertPreferenceService.getContactPreferences(E, C);
    expect(get.mock.calls[0]![0]).toBe(`/entities/${E}/alert-preferences/contact/${C}`);
  });

  it('getPreference calls single preference endpoint', async () => {
    const pref = { id: P };
    get.mockResolvedValueOnce({ data: { data: pref } });
    const result = await alertPreferenceService.getPreference(E, P);
    expect(get.mock.calls[0]![0]).toBe(`/entities/${E}/alert-preferences/${P}`);
    expect(result).toEqual(pref);
  });

  it('upsertPreference posts to alert-preferences', async () => {
    const pref = { id: P, alert_type_id: 't1' };
    post.mockResolvedValueOnce({ data: { data: pref } });

    const result = await alertPreferenceService.upsertPreference(E, {
      alert_type_id: 't1',
      preferenceable_type: 'Contact',
      preferenceable_id: C,
    });

    expect(post.mock.calls[0]![0]).toBe(`/entities/${E}/alert-preferences`);
    expect((post.mock.calls[0]![1]).alert_type_id).toBe('t1');
    expect(result).toEqual(pref);
  });

  it('updatePreference puts to correct endpoint', async () => {
    const pref = { id: P, email_enabled: true };
    put.mockResolvedValueOnce({ data: { data: pref } });

    await alertPreferenceService.updatePreference(E, P, { email_enabled: true });

    expect(put.mock.calls[0]![0]).toBe(`/entities/${E}/alert-preferences/${P}`);
  });

  it('bulkUpdatePreferences posts to bulk endpoint and returns updated/created counts', async () => {
    post.mockResolvedValueOnce({ data: { message: 'Preferences updated successfully', updated: 2, created: 1 } });

    const result = await alertPreferenceService.bulkUpdatePreferences(E, { preferences: [] });

    expect(post.mock.calls[0]![0]).toBe(`/entities/${E}/alert-preferences/bulk`);
    expect(result).toEqual({ message: 'Preferences updated successfully', updated: 2, created: 1 });
  });

  it('optOut posts to opt-out endpoint with reason', async () => {
    const pref = { id: P, opted_out: true };
    post.mockResolvedValueOnce({ data: { data: pref } });

    await alertPreferenceService.optOut(E, P, 'no longer needed');

    expect(post.mock.calls[0]![0]).toBe(`/entities/${E}/alert-preferences/${P}/opt-out`);
    expect((post.mock.calls[0]![1]).opt_out_reason).toBe('no longer needed');
  });

  it('optIn posts to opt-in endpoint', async () => {
    const pref = { id: P, opted_out: false };
    post.mockResolvedValueOnce({ data: { data: pref } });

    await alertPreferenceService.optIn(E, P);

    expect(post.mock.calls[0]![0]).toBe(`/entities/${E}/alert-preferences/${P}/opt-in`);
  });

  it('deletePreference calls delete endpoint', async () => {
    del.mockResolvedValueOnce({});
    await alertPreferenceService.deletePreference(E, P);
    expect(del.mock.calls[0]![0]).toBe(`/entities/${E}/alert-preferences/${P}`);
  });
});
