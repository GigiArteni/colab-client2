<template>
  <q-page class="usage-page">
    <UsageStatsCards
      :is-loading="usageStore.isLoading"
      :current-month-usage="usageStore.currentMonthUsage"
      :usage-unit="usageStore.usageUnit"
      :usage-trend="usageStore.usageTrend"
      :usage-change-percent="usageStore.usageChangePercent"
      :meters="usageStore.meters"
      :active-meters="usageStore.activeMeters"
      :selected-meter-id="usageStore.selectedMeterId"
      @select-meter="usageStore.selectMeter"
    />

    <LoadingSkeleton v-if="usageStore.isLoading" variant="detail" class="q-ma-xl" />

    <div v-else class="usage-content">
      <ErrorBanner :error="usageStore.error" show-retry @retry="loadData" />

      <UsageFilters
        :meter-options="meterOptions"
        :selected-meter-unit="usageStore.selectedMeter?.unit ?? ''"
        :readings="usageStore.readings"
        :is-submitting="usageStore.isSubmitting"
        @submit-reading="handleSubmitReading"
      />

      <UsageChart :chart-data="usageStore.chartData" />

      <!-- Meter Info -->
      <section v-if="usageStore.selectedMeter" class="meter-section">
        <h2 class="section-title">{{ $t('usage.meterInfo') }}</h2>
        <div class="meter-card">
          <div class="meter-card__row">
            <span class="meter-card__label">{{ $t('usage.serialNumber') }}</span>
            <span class="meter-card__value">{{ usageStore.selectedMeter.serial_number }}</span>
          </div>
          <div v-if="usageStore.selectedMeter.manufacturer" class="meter-card__row">
            <span class="meter-card__label">{{ $t('usage.manufacturer') }}</span>
            <span class="meter-card__value">{{ usageStore.selectedMeter.manufacturer }}</span>
          </div>
          <div class="meter-card__row">
            <span class="meter-card__label">{{ $t('usage.lastReading') }}</span>
            <span class="meter-card__value meter-card__value--highlight">
              {{ usageStore.selectedMeter.last_reading ?? '-' }} {{ usageStore.selectedMeter.unit }}
              <small v-if="usageStore.selectedMeter.last_reading_date" class="meter-card__date">
                {{ formatDate(usageStore.selectedMeter.last_reading_date) }}
              </small>
            </span>
          </div>
        </div>
      </section>

      <UsageReadingsTable :usages="usageStore.filteredUsages" />
    </div>

    <div class="page-spacer" />
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useUsageStore } from 'src/stores/usage';
import { useEntityStore } from 'src/stores/entity';
import { useSubscriptionsStore } from 'src/stores/subscriptions';
import LoadingSkeleton from 'src/components/ui/LoadingSkeleton.vue';
import ErrorBanner from 'src/components/ui/ErrorBanner.vue';
import UsageStatsCards from './components/UsageStatsCards.vue';
import UsageChart from './components/UsageChart.vue';
import UsageFilters from './components/UsageFilters.vue';
import UsageReadingsTable from './components/UsageReadingsTable.vue';

const $q = useQuasar();
const { t } = useI18n();
const usageStore = useUsageStore();
const entityStore = useEntityStore();
const subscriptionsStore = useSubscriptionsStore();

const entityId = computed(() => entityStore.selectedEntityId);
const subscriptionId = computed(() => subscriptionsStore.currentSubscription?.id ?? subscriptionsStore.subscriptions[0]?.id);

const meterOptions = computed(() =>
  usageStore.activeMeters.map((m) => ({ label: m.serial_number, value: m.id }))
);

async function loadData(): Promise<void> {
  if (!entityId.value || !subscriptionId.value) return;

  await Promise.all([
    usageStore.fetchUsages(entityId.value, subscriptionId.value),
    usageStore.fetchMeters(entityId.value, subscriptionId.value),
    usageStore.fetchStatistics(entityId.value, subscriptionId.value),
  ]);

  if (usageStore.selectedMeterId) {
    await usageStore.fetchMeterReadings(
      entityId.value,
      subscriptionId.value,
      usageStore.selectedMeterId
    );
  }
}

async function handleSubmitReading(payload: {
  meter_id: string;
  reading: number;
  reading_date?: string;
  notes?: string;
}): Promise<void> {
  if (!entityId.value || !subscriptionId.value) return;

  try {
    await usageStore.submitReading(entityId.value, subscriptionId.value, {
      meter_id: payload.meter_id,
      current_index: payload.reading,
      ...(payload.reading_date !== undefined ? { reading_date: payload.reading_date } : {}),
      ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
    });
    $q.notify({ type: 'positive', message: t('usage.readingSubmitted'), position: 'bottom' });
  } catch {
    $q.notify({ type: 'negative', message: t('usage.readingError'), position: 'bottom' });
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

onMounted(loadData);
</script>

<style lang="sass" scoped>
$primary: #0066FF
$gray-50: #F8FAFC
$gray-100: #F1F5F9
$gray-400: #94A3B8
$gray-500: #64748B
$gray-800: #1E293B
$gray-900: #0F172A
$radius-lg: 16px

.usage-page
  background: $gray-50
  min-height: 100vh

.usage-content
  padding: 20px

.section-title
  margin: 0 0 12px
  font-size: 16px
  font-weight: 600
  color: $gray-800

.meter-section
  margin-bottom: 24px

.meter-card
  background: white
  border-radius: $radius-lg
  border: 1px solid $gray-100
  overflow: hidden

  &__row
    display: flex
    justify-content: space-between
    align-items: center
    padding: 14px 16px
    border-bottom: 1px solid $gray-100

    &:last-child
      border-bottom: none

  &__label
    font-size: 14px
    color: $gray-500

  &__value
    font-size: 14px
    font-weight: 500
    color: $gray-900
    text-align: right

    &--highlight
      color: $primary
      font-weight: 600

  &__date
    display: block
    font-size: 12px
    color: $gray-400
    font-weight: 400
    margin-top: 2px

.page-spacer
  height: 24px

@media (min-width: 600px)
  .usage-content
    max-width: 600px
    margin: 0 auto
    padding: 0 24px 24px
</style>
