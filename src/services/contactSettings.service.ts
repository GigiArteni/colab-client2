import { api } from 'src/boot/axios';
import type { ContactSettings, UpdateContactSettingsPayload } from 'src/types';

// BE route: contacts/{contact}/settings (nested resource, index + show + update only)
const contactSettingsBase = (contactId: string) => `/contacts/${contactId}/settings`;

export const contactSettingsService = {
  async getSettings(contactId: string): Promise<ContactSettings> {
    const response = await api.get<{ data: ContactSettings[] }>(contactSettingsBase(contactId));
    // Index returns a collection; shape the first item or return empty defaults
    const raw = (response.data.data ?? [])[0] ?? ({} as ContactSettings);
    return raw;
  },

  async updateSettings(
    contactId: string,
    settingId: string,
    data: UpdateContactSettingsPayload
  ): Promise<ContactSettings> {
    const response = await api.patch<{ data: ContactSettings }>(
      `${contactSettingsBase(contactId)}/${settingId}`,
      data
    );
    return response.data.data;
  },
};
