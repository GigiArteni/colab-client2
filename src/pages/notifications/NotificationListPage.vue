<template>
  <q-page class="notifications-page">
    <!-- Header -->
    <header class="notifications-header">
      <div class="notifications-header__top">
        <div class="notifications-header__badge" v-if="notificationsStore.unreadCount > 0">
          {{ notificationsStore.unreadCount }} {{ $t('notifications.unread') }}
        </div>
        <button
          v-if="notificationsStore.hasUnread"
          class="mark-all-btn"
          @click="handleMarkAllRead"
        >
          <q-icon name="las la-check-double" />
          {{ $t('notifications.markAllRead') }}
        </button>
      </div>

      <!-- Filter Toggle -->
      <div class="filter-toggle">
        <button
          class="filter-toggle__btn"
          :class="{ 'filter-toggle__btn--active': !showUnreadOnly }"
          @click="handleFilterChange(false)"
        >
          {{ $t('notifications.all') }}
        </button>
        <button
          class="filter-toggle__btn"
          :class="{ 'filter-toggle__btn--active': showUnreadOnly }"
          @click="handleFilterChange(true)"
        >
          {{ $t('notifications.unreadOnly') }}
        </button>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="notificationsStore.isLoading" class="loading-state">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <!-- Content -->
    <div v-else class="notifications-content">
      <!-- Empty State -->
      <div v-if="notificationsStore.filteredNotifications.length === 0" class="empty-state">
        <div class="empty-state__icon">
          <q-icon name="las la-bell-slash" />
        </div>
        <h3 class="empty-state__title">{{ $t('notifications.noNotifications') }}</h3>
        <p class="empty-state__description">{{ $t('notifications.noNotificationsHint') }}</p>
      </div>

      <!-- Notifications List -->
      <q-pull-to-refresh v-else @refresh="refreshData" color="primary">
        <div class="notification-list">
          <q-slide-item
            v-for="notification in notificationsStore.filteredNotifications"
            :key="notification.id"
            @right="({ reset }) => handleDelete(notification.id, reset)"
            right-color="negative"
          >
            <template v-slot:right>
              <div class="slide-action">
                <q-icon name="las la-trash" />
              </div>
            </template>

            <div
              class="notification-card"
              :class="{ 'notification-card--unread': !notification.read_at }"
              @click="handleNotificationClick(notification)"
            >
              <div class="notification-card__icon" :class="`notification-card__icon--${getTypeCategory(notification.type)}`">
                <q-icon :name="getTypeIcon(notification.type)" />
              </div>

              <div class="notification-card__content">
                <h4 class="notification-card__title">{{ notification.title }}</h4>
                <p class="notification-card__body">{{ notification.body }}</p>
                <span class="notification-card__time">{{ formatRelativeTime(notification.created_at) }}</span>
              </div>

              <div v-if="!notification.read_at" class="notification-card__indicator"></div>
            </div>
          </q-slide-item>
        </div>

        <!-- Load More -->
        <div v-if="notificationsStore.hasMore" class="load-more">
          <button class="load-more__btn" @click="notificationsStore.loadMore()" :disabled="notificationsStore.isLoadingMore">
            <q-spinner-dots v-if="notificationsStore.isLoadingMore" color="primary" size="20px" />
            <template v-else>{{ $t('common.loadMore') }}</template>
          </button>
        </div>
      </q-pull-to-refresh>
    </div>

    <!-- Bottom Spacer -->
    <div class="page-spacer"></div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useNotificationsStore } from 'src/stores/notifications';
import type { Notification, NotificationType } from 'src/types';

const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();
const notificationsStore = useNotificationsStore();

const showUnreadOnly = ref(false);

function getTypeIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    invoice_created: 'las la-file-invoice',
    invoice_due: 'las la-clock',
    invoice_overdue: 'las la-exclamation-circle',
    payment_received: 'las la-check-circle',
    reading_reminder: 'las la-tachometer-alt',
    reading_approved: 'las la-check',
    reading_rejected: 'las la-times',
    subscription_update: 'las la-clipboard-list',
    maintenance_scheduled: 'las la-tools',
    alert: 'las la-exclamation-triangle',
    general: 'las la-info-circle',
  };
  return icons[type] || 'las la-bell';
}

function getTypeCategory(type: NotificationType): string {
  const categories: Record<NotificationType, string> = {
    invoice_created: 'info',
    invoice_due: 'warning',
    invoice_overdue: 'danger',
    payment_received: 'success',
    reading_reminder: 'warning',
    reading_approved: 'success',
    reading_rejected: 'danger',
    subscription_update: 'info',
    maintenance_scheduled: 'neutral',
    alert: 'danger',
    general: 'info',
  };
  return categories[type] || 'neutral';
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t('notifications.time.justNow');
  if (diffMins < 60) return t('notifications.time.minutesAgo', { count: diffMins });
  if (diffHours < 24) return t('notifications.time.hoursAgo', { count: diffHours });
  if (diffDays < 7) return t('notifications.time.daysAgo', { count: diffDays });
  return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: diffDays > 365 ? 'numeric' : undefined });
}

async function handleNotificationClick(notification: Notification): Promise<void> {
  if (!notification.read_at) {
    await notificationsStore.markAsRead(notification.id);
  }

  if (notification.data?.invoice_id) {
    void router.push({ name: 'invoice-detail', params: { id: notification.data.invoice_id } });
  } else if (notification.data?.subscription_id) {
    void router.push({ name: 'subscription-detail', params: { id: notification.data.subscription_id } });
  } else if (notification.data?.url) {
    window.open(notification.data.url, '_blank');
  }
}

async function handleMarkAllRead(): Promise<void> {
  try {
    await notificationsStore.markAllAsRead();
    $q.notify({ type: 'positive', message: t('notifications.allMarkedRead'), position: 'bottom' });
  } catch {
    $q.notify({ type: 'negative', message: t('common.error'), position: 'bottom' });
  }
}

async function handleDelete(id: string, reset: () => void): Promise<void> {
  try {
    await notificationsStore.deleteNotification(id);
    $q.notify({ type: 'info', message: t('notifications.deleted'), position: 'bottom' });
  } catch {
    reset();
    $q.notify({ type: 'negative', message: t('common.error'), position: 'bottom' });
  }
}

function handleFilterChange(value: boolean): void {
  showUnreadOnly.value = value;
  notificationsStore.setShowUnreadOnly(value);
  void notificationsStore.fetchNotifications();
}

async function refreshData(done: () => void): Promise<void> {
  try {
    await notificationsStore.fetchNotifications();
    notificationsStore.fetchSummary();
  } catch (err) {
    console.error('Failed to refresh:', err);
  }
  done();
}

onMounted(async () => {
  await notificationsStore.fetchNotifications();
    notificationsStore.fetchSummary();
});
</script>

<style lang="sass" scoped>
@import 'src/css/quasar.variables.sass'

$radius-sm: 8px
$radius-md: 12px
$radius-lg: 16px
$radius-full: 9999px

.notifications-page
  background: $gray-50
  min-height: 100vh

.notifications-header
  background: white
  padding: 20px
  border-bottom: 1px solid $gray-100

  &__top
    display: flex
    justify-content: space-between
    align-items: center
    margin-bottom: 16px

  &__badge
    padding: 6px 12px
    background: rgba($primary, 0.1)
    color: $primary
    border-radius: $radius-full
    font-size: 13px
    font-weight: 600

.mark-all-btn
  display: flex
  align-items: center
  gap: 6px
  padding: 8px 12px
  background: none
  border: none
  font-size: 13px
  font-weight: 500
  color: $primary
  cursor: pointer

  &:hover
    opacity: 0.8

.filter-toggle
  display: flex
  background: $gray-100
  border-radius: $radius-md
  padding: 4px

  &__btn
    flex: 1
    padding: 10px 16px
    border: none
    border-radius: $radius-sm
    background: transparent
    font-size: 14px
    font-weight: 500
    color: $gray-600
    cursor: pointer
    transition: all 0.2s ease

    &--active
      background: white
      color: $gray-900
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)

.loading-state
  display: flex
  justify-content: center
  padding: 60px

.notifications-content
  padding: 16px 20px

.empty-state
  display: flex
  flex-direction: column
  align-items: center
  padding: 60px 24px
  text-align: center

  &__icon
    width: 72px
    height: 72px
    border-radius: 50%
    background: $gray-100
    display: flex
    align-items: center
    justify-content: center
    font-size: 32px
    color: $gray-400
    margin-bottom: 20px

  &__title
    margin: 0 0 8px
    font-size: 18px
    font-weight: 600
    color: $gray-800

  &__description
    margin: 0
    font-size: 14px
    color: $gray-500

.notification-list
  display: flex
  flex-direction: column
  gap: 8px

.slide-action
  display: flex
  align-items: center
  justify-content: center
  width: 80px
  font-size: 20px
  color: white

.notification-card
  display: flex
  align-items: flex-start
  gap: 14px
  padding: 16px
  background: white
  border-radius: $radius-lg
  border: 1px solid $gray-100
  cursor: pointer
  transition: all 0.2s ease
  position: relative

  &:hover
    border-color: $gray-200

  &--unread
    background: rgba($primary, 0.02)
    border-color: rgba($primary, 0.1)

  &__icon
    width: 40px
    height: 40px
    border-radius: $radius-md
    display: flex
    align-items: center
    justify-content: center
    font-size: 18px
    flex-shrink: 0

    &--success
      background: rgba($positive, 0.1)
      color: $positive

    &--warning
      background: rgba($warning, 0.1)
      color: $warning

    &--danger
      background: rgba($negative, 0.1)
      color: $negative

    &--info
      background: rgba($info, 0.1)
      color: $info

    &--neutral
      background: $gray-100
      color: $gray-500

  &__content
    flex: 1
    min-width: 0

  &__title
    margin: 0
    font-size: 14px
    font-weight: 600
    color: $gray-900

    .notification-card--unread &
      font-weight: 700

  &__body
    margin: 4px 0 0
    font-size: 13px
    color: $gray-600
    display: -webkit-box
    -webkit-line-clamp: 2
    -webkit-box-orient: vertical
    overflow: hidden

  &__time
    display: block
    margin-top: 6px
    font-size: 12px
    color: $gray-400

  &__indicator
    position: absolute
    top: 16px
    right: 16px
    width: 8px
    height: 8px
    background: $primary
    border-radius: 50%

.load-more
  display: flex
  justify-content: center
  padding: 20px

  &__btn
    padding: 10px 24px
    border: 1px solid $gray-200
    border-radius: $radius-full
    background: white
    font-size: 14px
    font-weight: 500
    color: $gray-700
    cursor: pointer
    transition: all 0.2s ease
    min-width: 140px

    &:hover:not(:disabled)
      border-color: $primary
      color: $primary

    &:disabled
      opacity: 0.7
      cursor: not-allowed

.page-spacer
  height: 24px

@media (min-width: 600px)
  .notifications-header
    max-width: 600px
    margin: 0 auto
    border-bottom: none
    padding: 24px

  .notifications-content
    max-width: 600px
    margin: 0 auto
    padding: 0 24px 24px
</style>
