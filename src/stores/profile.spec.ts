/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('src/boot/axios', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock('src/composables/useTenant', () => ({
  useTenant: () => ({ slug: { value: 'acme' } }),
}));

import { useProfileStore } from './profile';
import { authService } from 'src/services/auth.service';

vi.mock('src/services/auth.service');
const mockedAuth = vi.mocked(authService);

describe('useProfileStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('starts with no user', () => {
    const store = useProfileStore();
    expect(store.user).toBeNull();
    expect(store.isLoaded).toBe(false);
  });

  it('fetchProfile sets user and isLoaded', async () => {
    const user = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      contact: { name: 'John Doe', email: 'john@example.com' },
    };
    mockedAuth.getProfile.mockResolvedValueOnce(user as any);

    const store = useProfileStore();
    await store.fetchProfile();

    expect(store.user).toEqual(user);
    expect(store.isLoaded).toBe(true);
    expect(store.isLoading).toBe(false);
  });

  it('displayName uses contact.name when available', async () => {
    mockedAuth.getProfile.mockResolvedValueOnce({
      id: '1',
      contact: { name: 'Jane Smith', email: 'jane@example.com' },
    } as any);

    const store = useProfileStore();
    await store.fetchProfile();

    expect(store.displayName).toBe('Jane Smith');
  });

  it('initials derives from displayName', async () => {
    mockedAuth.getProfile.mockResolvedValueOnce({
      id: '1',
      contact: { name: 'John Doe', email: 'j@example.com' },
    } as any);

    const store = useProfileStore();
    await store.fetchProfile();

    expect(store.initials).toBe('JD');
  });

  it('email falls back to user.email when no contact', async () => {
    mockedAuth.getProfile.mockResolvedValueOnce({
      id: '1',
      email: 'user@example.com',
      contact: null,
    } as any);

    const store = useProfileStore();
    await store.fetchProfile();

    expect(store.email).toBe('user@example.com');
  });

  it('$reset clears user and loaded state', async () => {
    mockedAuth.getProfile.mockResolvedValueOnce({ id: '1', contact: null } as any);
    const store = useProfileStore();
    await store.fetchProfile();
    store.$reset();
    expect(store.user).toBeNull();
    expect(store.isLoaded).toBe(false);
  });
});
