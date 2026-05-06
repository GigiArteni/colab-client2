<template>
  <q-page class="dashboard-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-center" style="min-height: 50vh" role="status" :aria-label="$t('common.loading')">
      <q-spinner-dots size="40px" color="primary" aria-hidden="true" />
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Stats Row (horizontal scroll on mobile) -->
      <div class="app-section">
        <div class="stats-row">
          <div class="stat-card stat-card--danger">
            <div class="stat-card__label">{{ $t('dashboard.unpaid') }}</div>
            <div class="stat-card__value">{{ formatCurrency(invoiceStats?.outstanding_amount ?? 0) }}</div>
            <div class="stat-card__sub">{{ getUnpaidCount() }} {{ $t('dashboard.invoices') }}</div>
          </div>

          <div class="stat-card stat-card--warning">
            <div class="stat-card__label">{{ $t('dashboard.overdue') }}</div>
            <div class="stat-card__value">{{ getOverdueCount() }}</div>
            <div class="stat-card__sub">{{ $t('dashboard.invoices') }}</div>
          </div>

          <div class="stat-card stat-card--success">
            <div class="stat-card__label">{{ $t('dashboard.paid') }}</div>
            <div class="stat-card__value">{{ formatCurrency(invoiceStats?.current_month?.total_collected ?? 0) }}</div>
            <div class="stat-card__sub">{{ getPaidCount() }} {{ $t('dashboard.invoices') }}</div>
          </div>
        </div>
      </div>

      <!-- My Subscriptions -->
      <div class="app-section">
        <div class="app-section__header">
          <h2 class="app-section__title">{{ $t('dashboard.mySubscriptions') }}</h2>
          <router-link v-if="subscriptions.length > 0" to="/subscriptions" class="app-section__action">
            {{ $t('common.viewDetails') }}
          </router-link>
        </div>

        <!-- Subscription list -->
        <template v-if="subscriptions.length > 0">
          <div
            v-for="subscription in subscriptions"
            :key="subscription.id"
            class="app-list-item"
            @click="goToSubscription(subscription.id)"
          >
            <div class="app-list-item__icon" :class="getUtilityIconClass(subscription.group)">
              <q-icon :name="getUtilityIcon(subscription.group)" size="22px" />
            </div>
            <div class="app-list-item__content">
              <div class="app-list-item__title">
                {{ $t(`utilities.${subscription.group}`) }}
              </div>
              <div class="app-list-item__subtitle">
                {{ subscription.address?.full_address || subscription.contract_no }}
              </div>
            </div>
            <div class="app-list-item__meta">
              <template v-if="subscription.lastUsage">
                <div class="app-list-item__value">
                  {{ subscription.lastUsage.consumption }} {{ subscription.lastUsage.unit }}
                </div>
                <div class="app-list-item__subtitle">{{ $t('dashboard.lastReading') }}</div>
              </template>
              <q-icon v-else name="las la-chevron-right" size="20px" color="grey-5" />
            </div>
          </div>
        </template>

        <!-- Empty state -->
        <div v-else class="empty-state" role="status">
          <q-icon name="las la-clipboard-list" class="empty-state__icon" aria-hidden="true" />
          <div class="empty-state__title">{{ $t('dashboard.noSubscriptions') }}</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="app-section">
        <q-btn
          color="primary"
          class="full-width portal-btn"
          :label="$t('dashboard.viewAllInvoices')"
          icon="las la-file-invoice-dollar"
          to="/invoices"
          unelevated
        />
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useEntityStore } from 'src/stores/entity';
import { subscriptionService } from 'src/services/subscription.service';
import { invoiceService } from 'src/services/invoice.service';
import type { Subscription, InvoiceStatistics, InvoiceStatusCounts } from 'src/types';

const router = useRouter();
const entityStore = useEntityStore();

const isLoading = ref(true);
const subscriptions = ref<Subscription[]>([]);
const invoiceStats = ref<InvoiceStatistics | null>(null);
const statusCounts = ref<InvoiceStatusCounts>({});

async function loadData(): Promise<void> {
  if (!entityStore.selectedEntityId) return;

  isLoading.value = true;

  try {
    const [subs, stats, counts] = await Promise.all([
      subscriptionService.getSubscriptions(entityStore.selectedEntityId, { include: 'lastUsage,address' }),
      invoiceService.getStatistics(entityStore.selectedEntityId),
      invoiceService.getStatusCounts(entityStore.selectedEntityId),
    ]);

    subscriptions.value = subs;
    invoiceStats.value = stats;
    statusCounts.value = counts;
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  } finally {
    isLoading.value = false;
  }
}

function getUnpaidCount(): number {
  return (statusCounts.value.pending ?? 0) +
         (statusCounts.value.sent ?? 0) +
         (statusCounts.value.partially_paid ?? 0);
}

function getOverdueCount(): number {
  return statusCounts.value.overdue ?? 0;
}

function getPaidCount(): number {
  return statusCounts.value.paid ?? 0;
}

function getUtilityIcon(type?: string): string {
  const icons: Record<string, string> = {
    'electricity': 'las la-bolt',
    'natural-gas': 'las la-fire',
    'water': 'las la-tint',
    'sewage': 'las la-water',
  };
  return icons[type || ''] || 'las la-plug';
}

function getUtilityIconClass(type?: string): string {
  const classes: Record<string, string> = {
    'electricity': 'utility-icon--electricity',
    'natural-gas': 'utility-icon--gas',
    'water': 'utility-icon--water',
    'sewage': 'utility-icon--sewage',
  };
  return 'utility-icon ' + (classes[type || ''] || 'utility-icon--gas');
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
  }).format(amount);
}

function goToSubscription(id: string): void {
  void router.push(`/subscriptions/${id}`);
}

// Load data when entity changes
watch(() => entityStore.selectedEntityId, () => {
  if (entityStore.selectedEntityId) {
    void loadData();
  }
}, { immediate: true });
</script>

<style lang="sass" scoped>
.dashboard-page
  padding: var(--space-md)
  padding-top: var(--space-lg)
</style>
