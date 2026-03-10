<template>
  <q-page class="usage-page">
    <!-- Header Stats Section -->
    <section class="usage-header">
      <div class="stats-card">
        <div class="stats-card__main">
          <span class="stats-card__label">{{ $t('usage.currentMonth') }}</span>
          <div class="stats-card__value">
            <template v-if="usageStore.isLoading">
              <div class="skeleton skeleton--text" style="width: 100px; height: 32px"></div>
            </template>
            <template v-else>
              {{ formatNumber(usageStore.currentMonthUsage) }}
              <small>{{ usageStore.usageUnit }}</small>
            </template>
          </div>
        </div>
        <div class="stats-card__trend" :class="`stats-card__trend--${usageStore.usageTrend}`" v-if="!usageStore.isLoading">
          <q-icon :name="getTrendIcon(usageStore.usageTrend)" />
          <span>{{ Math.abs(usageStore.usageChangePercent) }}%</span>
        </div>
      </div>

      <!-- Meter Selector -->
      <div v-if="usageStore.meters.length > 1" class="meter-selector">
        <button
          v-for="meter in usageStore.activeMeters"
          :key="meter.id"
          class="meter-chip"
          :class="{ 'meter-chip--active': usageStore.selectedMeterId === meter.id }"
          @click="usageStore.selectMeter(meter.id)"
        >
          <q-icon name="las la-tachometer-alt" />
          {{ meter.serial_number }}
        </button>
      </div>
    </section>

    <!-- Loading State -->
    <div v-if="usageStore.isLoading" class="loading-state">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <!-- Content -->
    <div v-else class="usage-content">
      <!-- Quick Actions -->
      <div class="quick-actions">
        <button class="action-btn action-btn--primary" @click="showSubmitDialog = true">
          <q-icon name="las la-edit" />
          {{ $t('usage.submitReading') }}
        </button>
        <button class="action-btn action-btn--secondary" @click="showHistoryDialog = true">
          <q-icon name="las la-history" />
          {{ $t('usage.history') }}
        </button>
      </div>

      <!-- Usage Chart -->
      <section class="chart-section">
        <h2 class="section-title">{{ $t('usage.monthlyConsumption') }}</h2>
        <div class="chart-card">
          <div class="chart">
            <div
              v-for="(value, index) in usageStore.chartData.data"
              :key="index"
              class="chart__bar-wrapper"
            >
              <div class="chart__bar" :style="{ height: getBarHeight(value) + '%' }">
                <span class="chart__value">{{ formatNumber(value) }}</span>
              </div>
              <span class="chart__label">{{ usageStore.chartData.labels[index] }}</span>
            </div>
          </div>
        </div>
      </section>

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

      <!-- Recent Usages -->
      <section class="recent-section">
        <h2 class="section-title">{{ $t('usage.recentUsages') }}</h2>
        <div class="recent-card">
          <template v-if="usageStore.filteredUsages.length > 0">
            <div
              v-for="usage in usageStore.filteredUsages.slice(0, 6)"
              :key="usage.id"
              class="usage-item"
            >
              <div class="usage-item__icon">
                <q-icon name="las la-chart-bar" />
              </div>
              <div class="usage-item__content">
                <span class="usage-item__period">{{ formatPeriod(usage.period_start, usage.period_end) }}</span>
                <span class="usage-item__details">
                  {{ usage.reading_start }} → {{ usage.reading_end }} {{ usage.unit }}
                  <span v-if="usage.is_estimated" class="usage-item__badge">{{ $t('usage.estimated') }}</span>
                </span>
              </div>
              <div class="usage-item__amount">
                <span class="usage-item__value">{{ formatNumber(usage.consumption) }}</span>
                <span class="usage-item__unit">{{ usage.unit }}</span>
              </div>
            </div>
          </template>
          <div v-else class="empty-state">
            <div class="empty-state__icon">
              <q-icon name="las la-chart-line" />
            </div>
            <p class="empty-state__text">{{ $t('usage.noUsages') }}</p>
          </div>
        </div>
      </section>
    </div>

    <!-- Submit Reading Dialog -->
    <q-dialog v-model="showSubmitDialog" position="bottom">
      <div class="dialog-sheet">
        <div class="dialog-sheet__header">
          <h3 class="dialog-sheet__title">{{ $t('usage.submitReading') }}</h3>
          <button class="dialog-sheet__close" @click="showSubmitDialog = false">
            <q-icon name="las la-times" />
          </button>
        </div>
        <div class="dialog-sheet__content">
          <q-form @submit.prevent="handleSubmitReading" class="form">
            <div class="form-group">
              <label class="form-label">{{ $t('usage.selectMeter') }}</label>
              <q-select
                v-model="readingForm.meter_id"
                :options="meterOptions"
                emit-value
                map-options
                outlined
                dense
                class="form-select"
                :rules="[(v) => !!v || $t('validation.required')]"
              />
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('usage.meterReading') }}</label>
              <q-input
                v-model.number="readingForm.reading"
                type="number"
                :suffix="usageStore.selectedMeter?.unit"
                outlined
                dense
                class="form-input"
                :rules="[
                  (v) => v !== null && v !== '' || $t('validation.required'),
                  (v) => v >= 0 || $t('validation.minValue', { min: 0 }),
                ]"
              />
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('usage.readingDate') }}</label>
              <q-input
                v-model="readingForm.reading_date"
                outlined
                dense
                readonly
                class="form-input"
              >
                <template v-slot:append>
                  <q-icon name="las la-calendar" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="readingForm.reading_date" mask="YYYY-MM-DD">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="OK" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('usage.notes') }}</label>
              <q-input
                v-model="readingForm.notes"
                type="textarea"
                rows="2"
                outlined
                dense
                class="form-input"
              />
            </div>

            <button type="submit" class="submit-btn" :disabled="usageStore.isSubmitting">
              <q-spinner-dots v-if="usageStore.isSubmitting" color="white" size="20px" />
              <template v-else>{{ $t('common.submit') }}</template>
            </button>
          </q-form>
        </div>
      </div>
    </q-dialog>

    <!-- History Dialog -->
    <q-dialog v-model="showHistoryDialog" position="bottom" full-height>
      <div class="dialog-sheet dialog-sheet--full">
        <div class="dialog-sheet__header">
          <h3 class="dialog-sheet__title">{{ $t('usage.readingHistory') }}</h3>
          <button class="dialog-sheet__close" @click="showHistoryDialog = false">
            <q-icon name="las la-times" />
          </button>
        </div>
        <div class="dialog-sheet__content dialog-sheet__content--scroll">
          <template v-if="usageStore.readings.length > 0">
            <div v-for="reading in usageStore.readings" :key="reading.id" class="reading-item">
              <div class="reading-item__icon" :class="`reading-item__icon--${reading.status}`">
                <q-icon :name="getReadingStatusIcon(reading.status)" />
              </div>
              <div class="reading-item__content">
                <span class="reading-item__value">
                  {{ formatNumber(reading.reading) }} {{ usageStore.selectedMeter?.unit }}
                </span>
                <span class="reading-item__details">
                  {{ formatDate(reading.reading_date) }} · {{ $t(`usage.source.${reading.source}`) }}
                </span>
              </div>
              <span class="reading-item__status" :class="`reading-item__status--${reading.status}`">
                {{ $t(`usage.readingStatus.${reading.status}`) }}
              </span>
            </div>
          </template>
          <div v-else class="empty-state">
            <div class="empty-state__icon">
              <q-icon name="las la-history" />
            </div>
            <p class="empty-state__text">{{ $t('usage.noReadings') }}</p>
          </div>
        </div>
      </div>
    </q-dialog>

    <!-- Bottom Spacer -->
    <div class="page-spacer"></div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useUsageStore } from 'src/stores/usage';
import { useAuthStore } from 'src/stores/auth';

const $q = useQuasar();
const { t } = useI18n();
const usageStore = useUsageStore();
const authStore = useAuthStore();

const showSubmitDialog = ref(false);
const showHistoryDialog = ref(false);

const readingForm = reactive({
  meter_id: null as number | null,
  reading: null as number | null,
  reading_date: new Date().toISOString().split('T')[0],
  notes: '',
});

const meterOptions = computed(() =>
  usageStore.activeMeters.map((m) => ({
    label: m.serial_number,
    value: m.id,
  }))
);

const entityId = computed(() => authStore.selectedEntityId);
const subscriptionId = computed(() => authStore.contact?.subscriptions?.[0]?.id);

function formatNumber(value: number): string {
  return value.toLocaleString('ro-RO', { maximumFractionDigits: 1 });
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatPeriod(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleDateString('ro-RO', { month: 'short' })} - ${endDate.toLocaleDateString('ro-RO', { month: 'short', year: 'numeric' })}`;
}

function getTrendIcon(trend: string): string {
  switch (trend) {
    case 'up': return 'las la-arrow-up';
    case 'down': return 'las la-arrow-down';
    default: return 'las la-minus';
  }
}

function getBarHeight(value: number): number {
  const max = Math.max(...usageStore.chartData.data, 1);
  return Math.max((value / max) * 100, 5);
}

function getReadingStatusIcon(status: string): string {
  switch (status) {
    case 'approved': return 'las la-check';
    case 'pending': return 'las la-clock';
    case 'rejected': return 'las la-times';
    default: return 'las la-question';
  }
}

async function handleSubmitReading(): Promise<void> {
  if (!entityId.value || !subscriptionId.value || !readingForm.meter_id || readingForm.reading === null) {
    return;
  }

  try {
    await usageStore.submitReading(entityId.value, subscriptionId.value, {
      meter_id: readingForm.meter_id,
      reading: readingForm.reading,
      ...(readingForm.reading_date ? { reading_date: readingForm.reading_date } : {}),
      ...(readingForm.notes ? { notes: readingForm.notes } : {}),
    });

    $q.notify({
      type: 'positive',
      message: t('usage.readingSubmitted'),
      position: 'bottom',
    });

    showSubmitDialog.value = false;
    readingForm.reading = null;
    readingForm.notes = '';
  } catch {
    $q.notify({
      type: 'negative',
      message: t('usage.readingError'),
      position: 'bottom',
    });
  }
}

onMounted(async () => {
  if (entityId.value && subscriptionId.value) {
    await Promise.all([
      usageStore.fetchUsages(entityId.value, subscriptionId.value),
      usageStore.fetchMeters(entityId.value, subscriptionId.value),
      usageStore.fetchStatistics(entityId.value, subscriptionId.value),
    ]);

    if (usageStore.selectedMeterId) {
      readingForm.meter_id = usageStore.selectedMeterId;
      await usageStore.fetchMeterReadings(
        entityId.value,
        subscriptionId.value,
        usageStore.selectedMeterId
      );
    }
  }
});
</script>

<style lang="sass" scoped>
// Design Tokens
$primary: #0066FF
$positive: #10B981
$negative: #EF4444
$warning: #F59E0B
$info: #3B82F6

$gray-50: #F8FAFC
$gray-100: #F1F5F9
$gray-200: #E2E8F0
$gray-300: #CBD5E1
$gray-400: #94A3B8
$gray-500: #64748B
$gray-600: #475569
$gray-700: #334155
$gray-800: #1E293B
$gray-900: #0F172A

$radius-sm: 8px
$radius-md: 12px
$radius-lg: 16px
$radius-xl: 20px
$radius-full: 9999px

// Page
.usage-page
  background: $gray-50
  min-height: 100vh

// Header
.usage-header
  background: white
  padding: 20px
  border-bottom: 1px solid $gray-100

.stats-card
  display: flex
  justify-content: space-between
  align-items: center
  padding: 20px
  background: linear-gradient(135deg, rgba($primary, 0.05) 0%, rgba($primary, 0.02) 100%)
  border: 1px solid rgba($primary, 0.1)
  border-radius: $radius-lg

  &__main
    display: flex
    flex-direction: column
    gap: 4px

  &__label
    font-size: 13px
    font-weight: 500
    color: $gray-500
    text-transform: uppercase
    letter-spacing: 0.03em

  &__value
    font-size: 32px
    font-weight: 700
    color: $gray-900

    small
      font-size: 14px
      font-weight: 500
      color: $gray-500
      margin-left: 4px

  &__trend
    display: flex
    align-items: center
    gap: 4px
    padding: 6px 12px
    border-radius: $radius-full
    font-size: 13px
    font-weight: 600

    &--up
      background: rgba($negative, 0.1)
      color: $negative

    &--down
      background: rgba($positive, 0.1)
      color: $positive

    &--stable
      background: $gray-100
      color: $gray-500

.meter-selector
  display: flex
  gap: 8px
  margin-top: 16px
  overflow-x: auto
  padding-bottom: 4px

  &::-webkit-scrollbar
    display: none

.meter-chip
  display: inline-flex
  align-items: center
  gap: 6px
  padding: 8px 14px
  border: 1px solid $gray-200
  border-radius: $radius-full
  background: white
  font-size: 13px
  font-weight: 500
  color: $gray-600
  cursor: pointer
  white-space: nowrap
  transition: all 0.2s ease

  &:hover
    border-color: $gray-300

  &--active
    background: $primary
    border-color: $primary
    color: white

// Loading
.loading-state
  display: flex
  justify-content: center
  padding: 60px

// Content
.usage-content
  padding: 20px

// Quick Actions
.quick-actions
  display: grid
  grid-template-columns: 1fr 1fr
  gap: 12px
  margin-bottom: 24px

.action-btn
  display: flex
  align-items: center
  justify-content: center
  gap: 8px
  padding: 14px 16px
  border-radius: $radius-md
  font-size: 14px
  font-weight: 600
  cursor: pointer
  transition: all 0.2s ease
  border: none

  &--primary
    background: $primary
    color: white

    &:hover
      background: #0052CC

  &--secondary
    background: white
    color: $gray-700
    border: 1px solid $gray-200

    &:hover
      border-color: $gray-300

  &:active
    transform: scale(0.98)

// Section
.section-title
  margin: 0 0 12px
  font-size: 16px
  font-weight: 600
  color: $gray-800

// Chart
.chart-section
  margin-bottom: 24px

.chart-card
  background: white
  border-radius: $radius-lg
  border: 1px solid $gray-100
  padding: 20px

.chart
  display: flex
  align-items: flex-end
  justify-content: space-between
  height: 140px
  gap: 8px

  &__bar-wrapper
    flex: 1
    display: flex
    flex-direction: column
    align-items: center
    height: 100%
    max-width: 50px

  &__bar
    width: 100%
    max-width: 28px
    background: linear-gradient(180deg, $primary 0%, rgba($primary, 0.7) 100%)
    border-radius: $radius-sm $radius-sm 0 0
    position: relative
    transition: height 0.3s ease
    min-height: 8px

  &__value
    position: absolute
    top: -20px
    left: 50%
    transform: translateX(-50%)
    font-size: 10px
    font-weight: 600
    color: $gray-600
    white-space: nowrap

  &__label
    margin-top: 8px
    font-size: 11px
    color: $gray-500
    text-align: center

// Meter Info
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

// Recent Usages
.recent-section
  margin-bottom: 24px

.recent-card
  background: white
  border-radius: $radius-lg
  border: 1px solid $gray-100
  overflow: hidden

.usage-item
  display: flex
  align-items: center
  gap: 14px
  padding: 14px 16px
  border-bottom: 1px solid $gray-100

  &:last-child
    border-bottom: none

  &__icon
    width: 40px
    height: 40px
    border-radius: $radius-md
    background: rgba($primary, 0.1)
    color: $primary
    display: flex
    align-items: center
    justify-content: center
    font-size: 18px
    flex-shrink: 0

  &__content
    flex: 1
    min-width: 0

  &__period
    display: block
    font-size: 14px
    font-weight: 500
    color: $gray-900

  &__details
    display: block
    font-size: 12px
    color: $gray-500
    margin-top: 2px

  &__badge
    display: inline-block
    padding: 2px 6px
    background: rgba($warning, 0.1)
    color: $warning
    border-radius: $radius-sm
    font-size: 10px
    font-weight: 600
    margin-left: 6px

  &__amount
    text-align: right
    flex-shrink: 0

  &__value
    display: block
    font-size: 15px
    font-weight: 700
    color: $primary

  &__unit
    display: block
    font-size: 11px
    color: $gray-500

// Empty State
.empty-state
  display: flex
  flex-direction: column
  align-items: center
  padding: 40px 20px
  text-align: center

  &__icon
    width: 56px
    height: 56px
    border-radius: 50%
    background: $gray-100
    display: flex
    align-items: center
    justify-content: center
    font-size: 24px
    color: $gray-400
    margin-bottom: 12px

  &__text
    margin: 0
    font-size: 14px
    color: $gray-500

// Dialog Sheet
.dialog-sheet
  background: white
  border-radius: $radius-xl $radius-xl 0 0
  width: 100%
  max-width: 500px
  margin: 0 auto

  &--full
    height: 85vh
    display: flex
    flex-direction: column

  &__header
    display: flex
    justify-content: space-between
    align-items: center
    padding: 20px
    border-bottom: 1px solid $gray-100

  &__title
    margin: 0
    font-size: 18px
    font-weight: 600
    color: $gray-900

  &__close
    width: 32px
    height: 32px
    border: none
    background: $gray-100
    border-radius: 50%
    display: flex
    align-items: center
    justify-content: center
    color: $gray-600
    cursor: pointer

    &:hover
      background: $gray-200

  &__content
    padding: 20px

    &--scroll
      flex: 1
      overflow-y: auto

// Form
.form
  display: flex
  flex-direction: column
  gap: 16px

.form-group
  display: flex
  flex-direction: column
  gap: 6px

.form-label
  font-size: 13px
  font-weight: 500
  color: $gray-700

.submit-btn
  width: 100%
  padding: 14px
  background: $primary
  color: white
  border: none
  border-radius: $radius-md
  font-size: 15px
  font-weight: 600
  cursor: pointer
  transition: all 0.2s ease
  margin-top: 8px

  &:hover:not(:disabled)
    background: #0052CC

  &:disabled
    opacity: 0.7
    cursor: not-allowed

// Reading Item
.reading-item
  display: flex
  align-items: center
  gap: 14px
  padding: 14px 16px
  border-bottom: 1px solid $gray-100

  &:last-child
    border-bottom: none

  &__icon
    width: 36px
    height: 36px
    border-radius: $radius-md
    display: flex
    align-items: center
    justify-content: center
    font-size: 16px
    flex-shrink: 0

    &--approved
      background: rgba($positive, 0.1)
      color: $positive

    &--pending
      background: rgba($warning, 0.1)
      color: $warning

    &--rejected
      background: rgba($negative, 0.1)
      color: $negative

  &__content
    flex: 1

  &__value
    display: block
    font-size: 14px
    font-weight: 600
    color: $gray-900

  &__details
    display: block
    font-size: 12px
    color: $gray-500
    margin-top: 2px

  &__status
    padding: 4px 10px
    border-radius: $radius-full
    font-size: 11px
    font-weight: 600

    &--approved
      background: rgba($positive, 0.1)
      color: $positive

    &--pending
      background: rgba($warning, 0.1)
      color: $warning

    &--rejected
      background: rgba($negative, 0.1)
      color: $negative

// Skeleton
.skeleton
  background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%)
  background-size: 200% 100%
  animation: skeleton-loading 1.5s infinite
  border-radius: $radius-sm

  &--text
    height: 16px

@keyframes skeleton-loading
  0%
    background-position: 200% 0
  100%
    background-position: -200% 0

// Spacer
.page-spacer
  height: 24px

// Tablet/Desktop
@media (min-width: 600px)
  .usage-header
    max-width: 600px
    margin: 0 auto
    border-bottom: none
    padding: 24px

  .usage-content
    max-width: 600px
    margin: 0 auto
    padding: 0 24px 24px

  .stats-card__value
    font-size: 36px
</style>
