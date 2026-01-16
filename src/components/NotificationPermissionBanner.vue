<template>
  <transition name="banner-slide">
    <q-banner
      v-if="shouldShow"
      class="notification-permission-banner bg-primary text-white"
      dense
      rounded
    >
      <template #avatar>
        <q-icon name="las la-bell" size="32px" />
      </template>

      <div class="banner-content">
        <div class="banner-title">Activează notificările</div>
        <div class="banner-message">
          Primește notificări instant pentru facturi, plăți și alerte importante
        </div>
      </div>

      <template #action>
        <q-btn
          flat
          dense
          label="Activează"
          color="white"
          :loading="requesting"
          @click="handleEnable"
          class="q-mr-xs"
        />
        <q-btn
          flat
          dense
          icon="las la-times"
          color="white"
          @click="handleDismiss"
        />
      </template>
    </q-banner>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useBrowserNotifications } from 'src/composables/useBrowserNotifications';

const $q = useQuasar();
const notifications = useBrowserNotifications();

const dismissed = ref(false);
const requesting = ref(false);

// LocalStorage key for dismissal
const DISMISSED_KEY = 'colab_notifications_banner_dismissed';

// Check if banner was previously dismissed
const wasDismissed = localStorage.getItem(DISMISSED_KEY) === 'true';

// Show banner if:
// - Notifications are supported
// - Permission is not granted yet
// - User hasn't dismissed banner
// - User hasn't explicitly disabled notifications
const shouldShow = computed(() => {
  return (
    notifications.isSupported.value &&
    notifications.permission.value === 'default' &&
    !dismissed.value &&
    !wasDismissed
  );
});

/**
 * Handle enable button click
 */
async function handleEnable() {
  requesting.value = true;

  try {
    const granted = await notifications.requestPermission();

    if (granted) {
      $q.notify({
        type: 'positive',
        message: 'Notificările au fost activate cu succes!',
        icon: 'las la-check',
        position: 'top',
      });

      // Show a test notification
      notifications.showSimpleNotification(
        'Notificări activate',
        'Vei primi notificări pentru alerte importante'
      );
    } else {
      $q.notify({
        type: 'info',
        message: 'Pentru a activa notificările, permite accesul în browser',
        icon: 'las la-info-circle',
        position: 'top',
      });
    }

    dismissed.value = true;
  } catch (error) {
    console.error('Error enabling notifications:', error);
    $q.notify({
      type: 'negative',
      message: 'Eroare la activarea notificărilor',
      icon: 'las la-exclamation-triangle',
      position: 'top',
    });
  } finally {
    requesting.value = false;
  }
}

/**
 * Handle dismiss button click
 */
function handleDismiss() {
  dismissed.value = true;
  localStorage.setItem(DISMISSED_KEY, 'true');
}

onMounted(() => {
  // Reset dismissed state on mount (banner shows again on new session if still default)
  dismissed.value = false;
});
</script>

<style lang="sass" scoped>
.notification-permission-banner
  margin-bottom: var(--space-md)
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15)

.banner-content
  flex: 1
  min-width: 0

.banner-title
  font-size: 1rem
  font-weight: 600
  margin-bottom: 4px

.banner-message
  font-size: 0.875rem
  opacity: 0.95
  line-height: 1.4

// Animation
.banner-slide-enter-active,
.banner-slide-leave-active
  transition: all 0.3s ease

.banner-slide-enter-from
  opacity: 0
  transform: translateY(-20px)

.banner-slide-leave-to
  opacity: 0
  transform: translateY(-10px)
</style>
