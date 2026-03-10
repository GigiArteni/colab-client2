/**
 * App Initialization Boot File
 * Following colab-ui2 appInit pattern
 *
 * Handles loading of critical app data:
 * 1. User profile
 * 2. User entities
 *
 * Called on:
 * - After successful login
 * - After page refresh (if authenticated)
 */

import { defineBoot } from '#q-app/wrappers';
import { useAuthStore } from 'src/stores/auth';
import { useProfileStore } from 'src/stores/profile';
import { useEntityStore } from 'src/stores/entity';

let initializationInProgress = false;

/**
 * Initialize app by loading profile and entities
 */
export async function initializeApp({ force = false } = {}): Promise<void> {
  if (initializationInProgress && !force) {
    return;
  }

  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    return;
  }

  const profileStore = useProfileStore();
  const entityStore = useEntityStore();

  initializationInProgress = true;

  try {
    const promises: Promise<void>[] = [];

    // Load profile if needed
    if (force || !profileStore.isLoaded) {
      promises.push(profileStore.fetchProfile());
    }

    // Load entities if needed
    if (force || !entityStore.isLoaded) {
      promises.push(entityStore.fetchEntities());
    }

    await Promise.all(promises);
  } catch (error) {
    console.error('[AppInit] Failed to initialize app:', error);
  } finally {
    initializationInProgress = false;
  }
}

/**
 * Clear all app data on logout
 */
export function clearAppData(): void {
  const profileStore = useProfileStore();
  const entityStore = useEntityStore();

  profileStore.$reset();
  entityStore.$reset();
}

export default defineBoot(({ router }) => {
  const authStore = useAuthStore();

  // Initialize app data before each route if authenticated
  router.beforeEach((to, from, next) => {
    // Skip for guest routes
    if (to.meta.requiresGuest) {
      next();
      return;
    }

    // Skip if not logged in
    if (!authStore.isAuthenticated) {
      next();
      return;
    }

    const profileStore = useProfileStore();
    const entityStore = useEntityStore();

    // Check if data needs to be loaded
    const needsProfile = !profileStore.isLoaded;
    const needsEntity = !entityStore.isLoaded;

    if (needsProfile || needsEntity) {
      void initializeApp({ force: false }).then(() => {
        next();
      });
    } else {
      next();
    }
  });
});
