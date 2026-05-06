/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { contactSettingsService } from './contactSettings.service';
import { api } from 'src/boot/axios';

vi.mock('src/boot/axios', () => ({
  api: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedGet = vi.mocked(api.get);
const mockedPatch = vi.mocked(api.patch);

const CONTACT_ID = 'c1';
const SETTING_ID = 's1';

const mockSettings = {
  contact_id: CONTACT_ID,
  billing_email_override: 'billing@example.com',
  preferred_notification_channel: 'email' as const,
  receive_invoices: true,
  receive_alerts: true,
  receive_readings_reminders: false,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('contactSettingsService', () => {
  describe('getSettings', () => {
    it('GETs /contacts/{contactId}/settings and returns first item', async () => {
      mockedGet.mockResolvedValue({ data: { data: [mockSettings] } });

      const result = await contactSettingsService.getSettings(CONTACT_ID);

      expect(mockedGet).toHaveBeenCalledWith(`/contacts/${CONTACT_ID}/settings`);
      expect(result).toEqual(mockSettings);
    });

    it('returns empty object when collection is empty', async () => {
      mockedGet.mockResolvedValue({ data: { data: [] } });

      const result = await contactSettingsService.getSettings(CONTACT_ID);

      expect(result).toEqual({});
    });
  });

  describe('updateSettings', () => {
    it('PATCHes payload to /contacts/{contactId}/settings/{settingId}', async () => {
      const payload = { receive_invoices: false };
      mockedPatch.mockResolvedValue({ data: { data: { ...mockSettings, ...payload } } });

      const result = await contactSettingsService.updateSettings(CONTACT_ID, SETTING_ID, payload);

      expect(mockedPatch).toHaveBeenCalledWith(
        `/contacts/${CONTACT_ID}/settings/${SETTING_ID}`,
        payload
      );
      expect(result.receive_invoices).toBe(false);
    });
  });
});
