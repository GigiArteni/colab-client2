/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { contactSettingsService } from './contactSettings.service';
import { api } from 'src/boot/axios';

vi.mock('src/boot/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedGet = vi.mocked(api.get);
const mockedPost = vi.mocked(api.post);

const mockSettings = {
  contact_id: 'c1',
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
    it('GETs /contacts/settings and returns data', async () => {
      mockedGet.mockResolvedValue({ data: { data: mockSettings } });

      const result = await contactSettingsService.getSettings();

      expect(mockedGet).toHaveBeenCalledWith('/contacts/settings');
      expect(result).toEqual(mockSettings);
    });
  });

  describe('updateSettings', () => {
    it('POSTs payload to /contacts/settings and returns updated data', async () => {
      const payload = { receive_invoices: false };
      mockedPost.mockResolvedValue({ data: { data: { ...mockSettings, ...payload } } });

      const result = await contactSettingsService.updateSettings(payload);

      expect(mockedPost).toHaveBeenCalledWith('/contacts/settings', payload);
      expect(result.receive_invoices).toBe(false);
    });
  });
});
