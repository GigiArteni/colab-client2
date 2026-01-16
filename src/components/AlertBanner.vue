<template>
  <transition-group
    name="alert-banner"
    tag="div"
    class="alert-banner-container"
  >
    <q-banner
      v-for="alert in alerts"
      :key="alert.id"
      :class="[
        'alert-banner',
        `alert-banner--${alert.priority}`,
        { 'alert-banner--dismissible': dismissible }
      ]"
      dense
      rounded
    >
      <template #avatar>
        <q-icon
          :name="getPriorityIcon(alert.priority)"
          :color="getPriorityColor(alert.priority)"
          size="24px"
        />
      </template>

      <div class="alert-banner__content">
        <div class="alert-banner__subject">{{ alert.subject }}</div>
        <div
          v-if="alert.content_rendered"
          class="alert-banner__body"
          v-html="sanitizeHtml(alert.content_rendered)"
        />
      </div>

      <template #action>
        <div class="alert-banner__actions">
          <!-- Navigate to action -->
          <q-btn
            v-if="alert.alertable && actionable"
            flat
            dense
            size="sm"
            :label="actionLabel"
            color="primary"
            @click="handleAction(alert)"
          />

          <!-- Dismiss button -->
          <q-btn
            v-if="dismissible"
            flat
            round
            dense
            icon="las la-times"
            :color="getPriorityColor(alert.priority)"
            :loading="dismissing.has(alert.id)"
            @click="handleDismiss(alert.id)"
          >
            <q-tooltip>Închide</q-tooltip>
          </q-btn>
        </div>
      </template>
    </q-banner>
  </transition-group>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Alert } from 'src/types/alert.types';

interface Props {
  alerts: Alert[];
  dismissible?: boolean;
  actionable?: boolean;
  actionLabel?: string;
}

interface Emits {
  (e: 'dismiss', alertId: string): void;
  (e: 'action', alert: Alert): void;
}

const props = withDefaults(defineProps<Props>(), {
  dismissible: true,
  actionable: true,
  actionLabel: 'Vezi detalii',
});

const emit = defineEmits<Emits>();
const router = useRouter();

const dismissing = ref(new Set<string>());

/**
 * Get priority icon
 */
function getPriorityIcon(priority: string): string {
  const icons: Record<string, string> = {
    urgent: 'las la-exclamation-circle',
    high: 'las la-exclamation-triangle',
    normal: 'las la-info-circle',
    low: 'las la-bell',
  };
  return icons[priority.toLowerCase()] || 'las la-info-circle';
}

/**
 * Get priority color
 */
function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    urgent: 'negative',
    high: 'orange',
    normal: 'primary',
    low: 'grey-7',
  };
  return colors[priority.toLowerCase()] || 'primary';
}

/**
 * Sanitize HTML content (basic sanitization)
 */
function sanitizeHtml(html: string): string {
  // For now, we trust backend-rendered content
  // In production, consider using a library like DOMPurify
  return html;
}

/**
 * Handle dismiss
 */
async function handleDismiss(alertId: string) {
  dismissing.value.add(alertId);

  try {
    emit('dismiss', alertId);
  } finally {
    setTimeout(() => {
      dismissing.value.delete(alertId);
    }, 500);
  }
}

/**
 * Handle action click
 */
function handleAction(alert: Alert) {
  emit('action', alert);

  // Default navigation based on alertable type
  if (alert.alertable_type && alert.alertable_id) {
    const routes: Record<string, string> = {
      Subscription: `/subscriptions/${alert.alertable_id}`,
      Invoice: `/invoices/${alert.alertable_id}`,
      Payment: `/payments/${alert.alertable_id}`,
    };

    const route = routes[alert.alertable_type];
    if (route) {
      void router.push(route);
    }
  }
}
</script>

<style lang="sass" scoped>
.alert-banner-container
  display: flex
  flex-direction: column
  gap: var(--space-sm)

.alert-banner
  border-left: 4px solid currentColor
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
  transition: all 0.3s ease

  &--urgent
    border-left-color: var(--q-negative)
    background: rgba(239, 68, 68, 0.05)

  &--high
    border-left-color: var(--q-orange)
    background: rgba(249, 115, 22, 0.05)

  &--normal
    border-left-color: var(--q-primary)
    background: rgba(37, 99, 235, 0.05)

  &--low
    border-left-color: var(--q-grey-7)
    background: rgba(0, 0, 0, 0.02)

.alert-banner__content
  flex: 1
  min-width: 0

.alert-banner__subject
  font-size: 0.9375rem
  font-weight: 600
  color: var(--color-text-primary)
  line-height: 1.4
  margin-bottom: 4px

.alert-banner__body
  font-size: 0.875rem
  color: var(--color-text-secondary)
  line-height: 1.4

  :deep(p)
    margin: 0

  :deep(a)
    color: var(--q-primary)
    text-decoration: underline

.alert-banner__actions
  display: flex
  gap: var(--space-xs)
  align-items: center

// Animation
.alert-banner-enter-active,
.alert-banner-leave-active
  transition: all 0.3s ease

.alert-banner-enter-from
  opacity: 0
  transform: translateY(-10px)

.alert-banner-leave-to
  opacity: 0
  transform: translateX(20px)

.alert-banner-move
  transition: transform 0.3s ease
</style>
