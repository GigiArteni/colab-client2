<template>
  <div>
    <!-- Notification Bell Button -->
    <q-btn
      flat
      round
      dense
      class="alert-bell-btn"
      @click="showDrawer = true"
    >
      <q-icon name="las la-bell" size="20px" />
      <q-badge
        v-if="alertsStore.unreadCount > 0"
        color="negative"
        floating
        :label="alertsStore.unreadCount > 99 ? '99+' : alertsStore.unreadCount"
        class="alert-badge"
      />
      <q-tooltip>Notificări ({{ alertsStore.unreadCount }})</q-tooltip>
    </q-btn>

    <!-- Bottom Drawer for Mobile -->
    <q-dialog
      v-model="showDrawer"
      position="bottom"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="alert-drawer">
        <!-- Header -->
        <q-card-section class="alert-drawer__header">
          <div class="alert-drawer__title">
            <q-icon name="las la-bell" size="24px" class="q-mr-sm" />
            <span>Notificări</span>
            <q-badge v-if="alertsStore.unreadCount > 0" color="negative" :label="alertsStore.unreadCount" class="q-ml-sm" />
          </div>
          <q-btn
            flat
            round
            dense
            icon="las la-times"
            @click="showDrawer = false"
          />
        </q-card-section>

        <q-separator />

        <!-- Filters -->
        <q-card-section class="alert-drawer__filters">
          <q-chip
            v-for="filter in filters"
            :key="filter.value"
            clickable
            :outline="selectedFilter !== filter.value"
            :color="selectedFilter === filter.value ? 'primary' : 'grey-3'"
            :text-color="selectedFilter === filter.value ? 'white' : 'grey-8'"
            @click="selectedFilter = filter.value; reloadAlerts()"
            class="q-mr-xs"
          >
            {{ filter.label }}
          </q-chip>
        </q-card-section>

        <q-separator />

        <!-- Alert List -->
        <q-card-section class="alert-drawer__content">
          <q-pull-to-refresh @refresh="onRefresh">
            <!-- Loading State -->
            <div v-if="alertsStore.isLoading && alerts.length === 0" class="alert-empty">
              <q-spinner-dots color="primary" size="50px" />
            </div>

            <!-- Empty State -->
            <div v-else-if="alerts.length === 0" class="alert-empty">
              <q-icon name="las la-bell-slash" size="64px" color="grey-5" />
              <div class="text-h6 q-mt-md text-grey-7">Fără notificări</div>
              <div class="text-caption text-grey-6">Nu aveți notificări {{ selectedFilter === 'unread' ? 'necitite' : '' }}</div>
            </div>

            <!-- Alert Items -->
            <q-list v-else separator class="alert-list">
              <q-item
                v-for="alert in alerts"
                :key="alert.id"
                clickable
                class="alert-item"
                :class="{ 'alert-item--unread': !alert.dismissed_at }"
                @click="handleViewAlert(alert)"
              >
                <!-- Priority Indicator -->
                <q-item-section side class="alert-item__priority">
                  <div class="priority-dot" :class="`priority-dot--${alert.priority}`"></div>
                </q-item-section>

                <!-- Content -->
                <q-item-section>
                  <q-item-label class="alert-item__subject">
                    {{ alert.subject }}
                  </q-item-label>
                  <q-item-label caption class="alert-item__body" lines="2">
                    {{ stripHtml(alert.content_rendered) }}
                  </q-item-label>
                  <q-item-label caption class="alert-item__meta q-mt-xs">
                    <q-icon name="las la-clock" size="14px" />
                    {{ formatDate(alert.created_at) }}
                  </q-item-label>
                </q-item-section>

                <!-- Actions -->
                <q-item-section side>
                  <q-btn
                    v-if="!alert.dismissed_at"
                    flat
                    round
                    dense
                    icon="las la-check"
                    size="sm"
                    color="primary"
                    :loading="alertsStore.dismissing.has(alert.id)"
                    @click.stop="handleDismiss(alert.id)"
                  >
                    <q-tooltip>Marchează ca citită</q-tooltip>
                  </q-btn>
                  <q-icon v-else name="las la-check-circle" size="20px" color="positive" />
                </q-item-section>
              </q-item>

              <!-- Load More -->
              <q-item v-if="alertsStore.hasMore" class="alert-load-more">
                <q-item-section>
                  <q-btn
                    flat
                    color="primary"
                    label="Încarcă mai multe"
                    icon="las la-angle-down"
                    :loading="alertsStore.isLoading"
                    @click="loadMore"
                    class="full-width"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-pull-to-refresh>
        </q-card-section>

        <!-- Footer Actions -->
        <q-card-actions class="alert-drawer__actions" v-if="alertsStore.unreadCount > 0">
          <q-btn
            flat
            color="primary"
            label="Marchează tot ca citit"
            icon="las la-check-double"
            @click="handleDismissAll"
            class="full-width"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Alert Details Dialog -->
    <q-dialog v-model="showDetailsDialog">
      <q-card style="min-width: 350px; max-width: 500px">
        <q-card-section v-if="selectedAlert" class="q-pb-none">
          <div class="text-h6">{{ selectedAlert.subject }}</div>
          <div class="text-caption text-grey-7 q-mt-xs">
            <q-icon name="las la-clock" size="14px" />
            {{ formatDateTime(selectedAlert.created_at) }}
          </div>
        </q-card-section>

        <q-card-section v-if="selectedAlert" v-html="selectedAlert.content_rendered" class="alert-details__content">
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Închide" color="grey-7" v-close-popup />
          <q-btn
            v-if="selectedAlert && !selectedAlert.dismissed_at"
            flat
            label="Marchează ca citită"
            color="primary"
            icon="las la-check"
            :loading="alertsStore.dismissing.has(selectedAlert.id)"
            @click="handleDismiss(selectedAlert.id)"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useAlertsStore } from 'src/stores/alerts';
import type { Alert } from 'src/types';

const $q = useQuasar();
const alertsStore = useAlertsStore();

// State
const showDrawer = ref(false);
const showDetailsDialog = ref(false);
const selectedAlert = ref<Alert | null>(null);
const selectedFilter = ref<'all' | 'unread'>('unread');

const filters = [
  { value: 'unread', label: 'Necitite' },
  { value: 'all', label: 'Toate' },
];

// Computed
const alerts = computed(() => {
  if (selectedFilter.value === 'unread') {
    return alertsStore.unreadAlerts;
  }
  return alertsStore.alerts;
});

// Methods
async function reloadAlerts(): Promise<void> {
  const dismissed = selectedFilter.value === 'all' ? undefined : false;
  await alertsStore.fetchAlerts({ dismissed });
}

async function loadMore(): Promise<void> {
  const dismissed = selectedFilter.value === 'all' ? undefined : false;
  await alertsStore.loadMore({ dismissed });
}

async function onRefresh(done: () => void): Promise<void> {
  await reloadAlerts();
  done();
}

function handleViewAlert(alert: Alert): void {
  selectedAlert.value = alert;
  showDetailsDialog.value = true;

  // Mark as read automatically when viewed
  if (!alert.dismissed_at) {
    setTimeout(() => {
      void handleDismiss(alert.id);
    }, 1000);
  }
}

async function handleDismiss(alertId: string): Promise<void> {
  const success = await alertsStore.dismissAlert(alertId);

  if (success) {
    $q.notify({
      type: 'positive',
      message: 'Notificare marcată ca citită',
      icon: 'las la-check',
      position: 'top',
      timeout: 2000,
    });
  } else {
    $q.notify({
      type: 'negative',
      message: 'Eroare la marcarea notificării',
      icon: 'las la-exclamation-triangle',
      position: 'top',
    });
  }
}

async function handleDismissAll(): Promise<void> {
  $q.dialog({
    title: 'Marchează tot ca citit',
    message: `Sigur doriți să marcați toate cele ${alertsStore.unreadCount} notificări ca citite?`,
    cancel: {
      label: 'Anulează',
      flat: true,
      color: 'grey',
    },
    ok: {
      label: 'Confirmă',
      color: 'primary',
      unelevated: true,
    },
  }).onOk(async () => {
    await alertsStore.dismissAllUnread();

    $q.notify({
      type: 'positive',
      message: 'Toate notificările au fost marcate ca citite',
      icon: 'las la-check',
      position: 'top',
    });
  });
}

function stripHtml(html?: string): string {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Acum';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}z`;

  return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Lifecycle
onMounted(() => {
  void reloadAlerts();
});
</script>

<style lang="sass" scoped>
.alert-bell-btn
  color: var(--color-text-secondary)

.alert-badge
  font-size: 0.625rem
  padding: 2px 4px
  min-width: 16px
  height: 16px

// Drawer
.alert-drawer
  width: 100%
  height: 100%
  display: flex
  flex-direction: column
  border-radius: var(--radius-xl) var(--radius-xl) 0 0

.alert-drawer__header
  display: flex
  align-items: center
  justify-content: space-between
  padding: var(--space-lg)
  background: var(--color-surface)
  border-bottom: 1px solid var(--color-border-light)

.alert-drawer__title
  display: flex
  align-items: center
  font-size: 1.125rem
  font-weight: 600
  color: var(--color-text-primary)

.alert-drawer__filters
  display: flex
  overflow-x: auto
  padding: var(--space-sm) var(--space-md)
  gap: var(--space-xs)
  background: var(--color-surface)

  &::-webkit-scrollbar
    display: none

.alert-drawer__content
  flex: 1
  overflow-y: auto
  padding: 0

.alert-drawer__actions
  padding: var(--space-md)
  background: var(--color-surface)
  border-top: 1px solid var(--color-border-light)

// Alert List
.alert-list
  padding: 0

.alert-item
  min-height: 80px
  padding: var(--space-md)
  transition: background var(--transition-fast)

  &:active
    background: rgba(0, 0, 0, 0.05)

.alert-item--unread
  background: rgba(37, 99, 235, 0.04)

  .alert-item__subject
    font-weight: 600

.alert-item__priority
  width: 8px
  padding-right: var(--space-sm)

.priority-dot
  width: 6px
  height: 6px
  border-radius: 50%

  &--urgent
    background: #EF4444

  &--high
    background: #F97316

  &--normal
    background: #3B82F6

  &--low
    background: #9CA3AF

.alert-item__subject
  font-size: 0.9375rem
  color: var(--color-text-primary)
  line-height: 1.4

.alert-item__body
  font-size: 0.8125rem
  color: var(--color-text-secondary)
  line-height: 1.4
  margin-top: 4px

.alert-item__meta
  display: flex
  align-items: center
  gap: 4px
  font-size: 0.75rem
  color: var(--color-text-muted)

.alert-load-more
  padding: var(--space-sm)

// Empty State
.alert-empty
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  padding: var(--space-2xl) var(--space-md)
  min-height: 300px
  text-align: center

// Details
.alert-details__content
  max-height: 400px
  overflow-y: auto
  font-size: 0.9375rem
  line-height: 1.6
</style>
