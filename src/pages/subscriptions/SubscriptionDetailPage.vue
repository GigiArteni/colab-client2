<template>
  <q-page padding>
    <!-- Back Button -->
    <q-btn flat color="grey" icon="las la-arrow-left" :label="$t('common.back')" @click="router.back()" class="q-mb-md" />

    <!-- Context Alerts -->
    <AlertBanner
      v-if="!isLoading && subscription && contextAlerts.alerts.value.length > 0"
      :alerts="contextAlerts.alerts.value"
      :dismissible="true"
      :actionable="true"
      :action-label="$t('alertPreferences.viewDetails')"
      @dismiss="contextAlerts.dismissAlert"
      class="q-mb-md"
    />

    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <!-- Content -->
    <template v-else-if="subscription">
      <!-- Header -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row items-center q-gutter-md">
            <q-icon
              :name="getUtilityIcon(subscription.group)"
              :color="getUtilityColor(subscription.group)"
              size="48px"
            />
            <div class="col">
              <div class="text-h5">{{ $t(`utilities.${subscription.group}`) }}</div>
              <div class="text-caption text-grey">
                {{ $t('subscriptions.contract') }}: {{ subscription.contract_no }}
              </div>
            </div>
            <q-chip
              :color="subscription.is_active ? 'positive' : 'grey'"
              text-color="white"
              :label="$t(`subscriptions.status.${subscription.is_active ? 'active' : 'inactive'}`)"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6" v-if="subscription.address?.full_address">
              <div class="text-caption text-grey">{{ $t('subscriptions.address') }}</div>
              <div class="text-body1">
                {{ subscription.address.full_address }}
              </div>
            </div>
            <div class="col-6 col-md-3" v-if="subscription.connection_date || subscription.activated_at">
              <div class="text-caption text-grey">{{ $t('subscriptions.startDate') }}</div>
              <div class="text-body1">{{ formatDate(subscription.connection_date || subscription.activated_at || '') }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Customer Info Card -->
      <q-card v-if="customer" flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle2 text-grey q-mb-sm">{{ $t('subscriptions.customer') }}</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <div class="text-caption text-grey">{{ $t('subscriptions.customerName') }}</div>
              <div class="text-body1">{{ customer.billing_name || customer.name }}</div>
            </div>
            <div v-if="customer.email" class="col-12 col-md-4">
              <div class="text-caption text-grey">{{ $t('subscriptions.customerEmail') }}</div>
              <div class="text-body1">{{ customer.email }}</div>
            </div>
            <div v-if="customer.phone" class="col-12 col-md-4">
              <div class="text-caption text-grey">{{ $t('subscriptions.customerPhone') }}</div>
              <div class="text-body1">{{ customer.phone }}</div>
            </div>
            <div v-if="customer.tax_id" class="col-12 col-md-4">
              <div class="text-caption text-grey">{{ $t('subscriptions.customerTaxId') }}</div>
              <div class="text-body1">{{ customer.tax_id }}</div>
            </div>
            <div v-if="customer.address" class="col-12 col-md-8">
              <div class="text-caption text-grey">{{ $t('subscriptions.customerAddress') }}</div>
              <div class="text-body1">{{ customer.address }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Tabs -->
      <q-tabs v-model="activeTab" class="q-mb-md" align="left" active-color="primary" indicator-color="primary">
        <q-tab name="usage" :label="$t('subscriptions.usageHistory')" icon="las la-chart-bar" />
        <q-tab name="meters" :label="$t('subscriptions.meters')" icon="las la-tachometer-alt" />
      </q-tabs>

      <!-- Usage Tab -->
      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel name="usage">
          <UsageChart
            v-if="usages.length > 0"
            :usages="usages"
            :unit="subscription.lastUsage?.unit || ''"
          />

          <!-- Usage Table -->
          <q-table
            :rows="usages"
            :columns="usageColumns"
            row-key="id"
            flat
            bordered
            class="q-mt-md"
          >
            <template #body-cell-reading_type="props">
              <q-td :props="props">
                <q-chip
                  dense
                  size="sm"
                  :color="props.value === 'actual' ? 'positive' : 'warning'"
                  :label="$t(`usage.type.${props.value}`)"
                />
              </q-td>
            </template>
          </q-table>

          <div v-if="usages.length === 0" class="text-center text-grey q-pa-xl">
            <q-icon name="las la-chart-line" size="48px" class="q-mb-sm" />
            <div>{{ $t('usage.noData') }}</div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="meters">
          <div class="row q-col-gutter-md">
            <div
              v-for="meter in meters"
              :key="meter.id"
              class="col-12 col-md-6"
            >
              <q-card flat bordered>
                <q-card-section>
                  <div class="row items-center">
                    <q-icon name="las la-tachometer-alt" size="32px" color="primary" class="q-mr-md" />
                    <div class="col">
                      <div class="text-subtitle1">{{ meter.serial_number }}</div>
                      <div class="text-caption text-grey">{{ meter.meter_type }}</div>
                    </div>
                    <q-chip
                      dense
                      :color="meter.status === 'active' ? 'positive' : 'grey'"
                      :label="$t(`meters.status.${meter.status}`)"
                    />
                  </div>
                </q-card-section>
                <q-separator />
                <q-card-section class="text-body2">
                  <div v-if="meter.last_reading_value !== undefined">
                    {{ $t('meters.lastReading') }}: {{ meter.last_reading_value }} {{ meter.unit }}
                  </div>
                  <div v-if="meter.last_reading_date" class="text-caption text-grey">
                    {{ formatDate(meter.last_reading_date) }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <div v-if="meters.length === 0" class="text-center text-grey q-pa-xl">
            <q-icon name="las la-tachometer-alt" size="48px" class="q-mb-sm" />
            <div>{{ $t('meters.noMeters') }}</div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </template>

    <!-- Not Found -->
    <q-card v-else flat bordered>
      <q-card-section class="text-center text-grey q-pa-xl">
        <q-icon name="las la-exclamation-circle" size="64px" class="q-mb-md" />
        <div class="text-h6">{{ $t('subscriptions.notFound') }}</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useEntityStore } from 'src/stores/entity';
import { subscriptionService } from 'src/services/subscription.service';
import { usageService } from 'src/services/usage.service';
import { useContextAlerts } from 'src/composables/useContextAlerts';
import UsageChart from 'src/components/UsageChart.vue';
import AlertBanner from 'src/components/AlertBanner.vue';
import type { Subscription, Meter, UsageRecord, SubscriptionCustomer } from 'src/types';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const entityStore = useEntityStore();

// Context alerts for this subscription
const contextAlerts = useContextAlerts({
  resourceType: 'subscriptions',
  resourceId: () => route.params.id as string,
  unreadOnly: true,
  autoLoad: false, // Load manually after subscription loads
});

const isLoading = ref(true);
const subscription = ref<Subscription | null>(null);
const customer = ref<SubscriptionCustomer | null>(null);
const usages = ref<UsageRecord[]>([]);
const meters = ref<Meter[]>([]);
const activeTab = ref('usage');

const usageColumns = computed(() => [
  { name: 'reading_end_date', label: t('usage.period'), field: 'reading_end_date', format: formatDate, align: 'left' as const },
  { name: 'previous_reading', label: t('usage.previousReading'), field: 'previous_reading', align: 'right' as const },
  { name: 'current_reading', label: t('usage.currentReading'), field: 'current_reading', align: 'right' as const },
  { name: 'consumption', label: t('usage.consumption'), field: 'consumption', align: 'right' as const },
  { name: 'unit', label: t('usage.unit'), field: 'unit', align: 'center' as const },
  { name: 'reading_type', label: t('usage.readingType'), field: 'reading_type', align: 'center' as const },
]);

async function loadData(): Promise<void> {
  if (!entityStore.selectedEntityId) return;

  const subscriptionId = route.params.id as string;
  if (!subscriptionId) return;

  isLoading.value = true;

  try {
    const [sub, usageData, meterData] = await Promise.all([
      subscriptionService.getSubscription(entityStore.selectedEntityId, subscriptionId),
      usageService.getSubscriptionUsages(entityStore.selectedEntityId, subscriptionId, { period: 'last_12_months' }),
      subscriptionService.getMeters(entityStore.selectedEntityId, subscriptionId),
    ]);

    subscription.value = sub;
    usages.value = usageData.data ?? [];
    meters.value = meterData;

    // Load customer info and context alerts in parallel
    const [customerData] = await Promise.all([
      subscriptionService.getCustomer(entityStore.selectedEntityId, subscriptionId).catch(() => null),
      contextAlerts.loadAlerts(),
    ]);
    customer.value = customerData;
  } catch (error) {
    console.error('Failed to load subscription data:', error);
    subscription.value = null;
  } finally {
    isLoading.value = false;
  }
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

function getUtilityColor(type?: string): string {
  const colors: Record<string, string> = {
    'electricity': 'amber',
    'natural-gas': 'orange',
    'water': 'blue',
    'sewage': 'teal',
  };
  return colors[type || ''] || 'grey';
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

onMounted(() => {
  void loadData();
});
</script>
