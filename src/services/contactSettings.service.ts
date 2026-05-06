import { api } from 'src/boot/axios';
import type { ContactSettings, UpdateContactSettingsPayload } from 'src/types';

const CONTACT_SETTINGS_ENDPOINT = '/contacts/settings';

export const contactSettingsService = {
  async getSettings(): Promise<ContactSettings> {
    const response = await api.get<{ data: ContactSettings }>(CONTACT_SETTINGS_ENDPOINT);
    return response.data.data;
  },

  async updateSettings(data: UpdateContactSettingsPayload): Promise<ContactSettings> {
    const response = await api.post<{ data: ContactSettings }>(CONTACT_SETTINGS_ENDPOINT, data);
    return response.data.data;
  },
};
