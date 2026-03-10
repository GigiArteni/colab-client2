/**
 * Profile Store
 * Manages current user profile
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from 'src/services/auth.service';
import type { User, Contact } from 'src/types';

export const useProfileStore = defineStore('profile', () => {
  // State
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const isLoaded = ref(false);

  // Computed
  const contact = computed<Contact | null>(() => user.value?.contact || null);

  const displayName = computed(() => {
    if (contact.value) {
      return contact.value.name || `${contact.value.first_name} ${contact.value.last_name}`;
    }
    return user.value?.name || '';
  });

  const initials = computed(() => {
    const name = displayName.value;
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  });

  const email = computed(() => contact.value?.email || user.value?.email || '');
  const phone = computed(() => contact.value?.phone || user.value?.phone || '');

  /**
   * Fetch user profile from API
   */
  async function fetchProfile(): Promise<void> {
    if (isLoading.value) return;

    isLoading.value = true;

    try {
      user.value = await authService.getProfile();
      isLoaded.value = true;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Reset store state
   */
  function $reset(): void {
    user.value = null;
    isLoaded.value = false;
    isLoading.value = false;
  }

  return {
    // State
    user,
    isLoading,
    isLoaded,

    // Computed
    contact,
    displayName,
    initials,
    email,
    phone,

    // Actions
    fetchProfile,
    $reset,
  };
});
