/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { profileService } from './profile.service';
import { api } from 'src/boot/axios';

vi.mock('src/boot/axios', () => ({
  api: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedGet = vi.mocked(api.get);
const mockedPatch = vi.mocked(api.patch);
const mockedDelete = vi.mocked(api.delete);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('profileService.getSettings', () => {
  it('GETs /profile/settings', async () => {
    const mockSettings = {
      notification_preferences: {},
      language: 'en',
      timezone: 'UTC',
      communication_channels: { preferred_channel: 'email' },
    };
    mockedGet.mockResolvedValue({ data: { data: mockSettings } });

    const result = await profileService.getSettings();

    expect(mockedGet).toHaveBeenCalledWith('/profile/settings');
    expect(result).toEqual(mockSettings);
  });
});

describe('profileService.updateSettings', () => {
  it('PATCHes /profile/settings with payload', async () => {
    const payload = { language: 'ro' };
    const updated = { language: 'ro', timezone: 'UTC', notification_preferences: {}, communication_channels: { preferred_channel: 'email' } };
    mockedPatch.mockResolvedValue({ data: { data: updated } });

    const result = await profileService.updateSettings(payload);

    expect(mockedPatch).toHaveBeenCalledWith('/profile/settings', payload);
    expect(result.language).toBe('ro');
  });
});

describe('profileService.listDevices', () => {
  it('GETs /profile/device-tokens', async () => {
    const devices = [{ id: '1', device_name: 'iPhone', platform: 'ios', last_used: null, created_at: '2026-01-01' }];
    mockedGet.mockResolvedValue({ data: { data: devices } });

    const result = await profileService.listDevices();

    expect(mockedGet).toHaveBeenCalledWith('/profile/device-tokens');
    expect(result).toHaveLength(1);
    expect(result[0]?.device_name).toBe('iPhone');
  });
});

describe('profileService.revokeDevice', () => {
  it('DELETEs /profile/device-tokens/{id}', async () => {
    mockedDelete.mockResolvedValue({});

    await profileService.revokeDevice('abc123');

    expect(mockedDelete).toHaveBeenCalledWith('/profile/device-tokens/abc123');
  });
});

describe('profileService.getProfile', () => {
  it('GETs /profile', async () => {
    const profile = { data: { id: 'u1', name: 'Ion' } };
    mockedGet.mockResolvedValue({ data: profile });

    const result = await profileService.getProfile();

    expect(mockedGet).toHaveBeenCalledWith('/profile');
    expect(result).toEqual(profile);
  });
});

describe('profileService.updateProfile', () => {
  it('PATCHes /profile with payload', async () => {
    const updated = { data: { id: 'u1', name: 'New Name' } };
    mockedPatch.mockResolvedValue({ data: updated });

    const result = await profileService.updateProfile({ name: 'New Name' } as any);

    expect(mockedPatch).toHaveBeenCalledWith('/profile', { name: 'New Name' });
    expect(result).toEqual(updated);
  });
});

describe('profileService.changePassword', () => {
  it('POSTs /profile/password', async () => {
    const mockedPost = vi.mocked(api.post);
    mockedPost.mockResolvedValue({});

    await profileService.changePassword({ current_password: 'old', password: 'new', password_confirmation: 'new' } as any);

    expect(mockedPost).toHaveBeenCalledWith('/profile/password', expect.objectContaining({ current_password: 'old' }));
  });
});

describe('profileService.getPreferences', () => {
  it('GETs /profile/preferences and unwraps data', async () => {
    const prefs = { theme: 'dark', language: 'ro' };
    mockedGet.mockResolvedValue({ data: { data: prefs } });

    const result = await profileService.getPreferences();

    expect(mockedGet).toHaveBeenCalledWith('/profile/preferences');
    expect(result).toEqual(prefs);
  });
});

describe('profileService.updatePreferences', () => {
  it('PATCHes /profile/preferences', async () => {
    const prefs = { theme: 'light', language: 'en' };
    mockedPatch.mockResolvedValue({ data: { data: prefs } });

    const result = await profileService.updatePreferences({ theme: 'light' } as any);

    expect(mockedPatch).toHaveBeenCalledWith('/profile/preferences', { theme: 'light' });
    expect(result).toEqual(prefs);
  });
});

describe('profileService.sendContactMessage', () => {
  it('POSTs /support/messages', async () => {
    const mockedPost = vi.mocked(api.post);
    mockedPost.mockResolvedValue({});

    await profileService.sendContactMessage({ subject: 'Help', message: 'I need help' } as any);

    expect(mockedPost).toHaveBeenCalledWith('/support/messages', expect.objectContaining({ subject: 'Help' }));
  });
});

describe('profileService.registerDeviceToken', () => {
  it('POSTs token and platform to /profile/device-token', async () => {
    const mockedPost = vi.mocked(api.post);
    mockedPost.mockResolvedValue({});

    await profileService.registerDeviceToken('tok123', 'web');

    expect(mockedPost).toHaveBeenCalledWith('/profile/device-token', { token: 'tok123', platform: 'web' });
  });
});

describe('profileService.unregisterDeviceToken', () => {
  it('DELETEs /profile/device-token with token in body', async () => {
    mockedDelete.mockResolvedValue({});

    await profileService.unregisterDeviceToken('tok123');

    expect(mockedDelete).toHaveBeenCalledWith('/profile/device-token', { data: { token: 'tok123' } });
  });
});
