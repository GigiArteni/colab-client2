<template>
  <!-- Quick action buttons + submit/history dialogs -->
  <div class="usage-filters">
    <div class="quick-actions">
      <button
        class="action-btn action-btn--primary"
        :aria-label="$t('usage.submitReading')"
        @click="showSubmitDialog = true"
      >
        <q-icon name="las la-edit" />
        {{ $t('usage.submitReading') }}
      </button>
      <button
        class="action-btn action-btn--secondary"
        :aria-label="$t('usage.history')"
        @click="showHistoryDialog = true"
      >
        <q-icon name="las la-history" />
        {{ $t('usage.history') }}
      </button>
    </div>

    <!-- Submit Reading Dialog -->
    <q-dialog v-model="showSubmitDialog" position="bottom">
      <div class="dialog-sheet">
        <div class="dialog-sheet__header">
          <h3 class="dialog-sheet__title">{{ $t('usage.submitReading') }}</h3>
          <button class="dialog-sheet__close" :aria-label="$t('common.close')" @click="showSubmitDialog = false">
            <q-icon name="las la-times" />
          </button>
        </div>
        <div class="dialog-sheet__content">
          <q-form @submit.prevent="handleSubmitReading" class="form">
            <div class="form-group">
              <label class="form-label" for="meter-select">{{ $t('usage.selectMeter') }}</label>
              <q-select
                id="meter-select"
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
              <label class="form-label" for="meter-reading">{{ $t('usage.meterReading') }}</label>
              <q-input
                id="meter-reading"
                v-model.number="readingForm.reading"
                type="number"
                :suffix="selectedMeterUnit"
                outlined
                dense
                class="form-input"
                :rules="[
                  (v) => (v !== null && v !== '') || $t('validation.required'),
                  (v) => v >= 0 || $t('validation.minValue', { min: 0 }),
                ]"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="reading-date">{{ $t('usage.readingDate') }}</label>
              <q-input
                id="reading-date"
                v-model="readingForm.reading_date"
                outlined
                dense
                readonly
                class="form-input"
              >
                <template #append>
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
              <label class="form-label" for="reading-notes">{{ $t('usage.notes') }}</label>
              <q-input
                id="reading-notes"
                v-model="readingForm.notes"
                type="textarea"
                rows="2"
                outlined
                dense
                class="form-input"
              />
            </div>

            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              <q-spinner-dots v-if="isSubmitting" color="white" size="20px" />
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
          <button class="dialog-sheet__close" :aria-label="$t('common.close')" @click="showHistoryDialog = false">
            <q-icon name="las la-times" />
          </button>
        </div>
        <div class="dialog-sheet__content dialog-sheet__content--scroll">
          <template v-if="readings.length > 0">
            <div v-for="reading in readings" :key="reading.id" class="reading-item">
              <div class="reading-item__icon" :class="`reading-item__icon--${reading.status ?? 'pending'}`">
                <q-icon :name="getReadingStatusIcon(reading.status ?? 'pending')" />
              </div>
              <div class="reading-item__content">
                <span class="reading-item__value">
                  {{ reading.reading != null ? formatNumber(reading.reading) : '-' }} {{ selectedMeterUnit }}
                </span>
                <span class="reading-item__details">
                  {{ reading.reading_date ? formatDate(reading.reading_date) : '-' }} · {{ $t(`usage.source.${reading.source ?? 'manual'}`) }}
                </span>
              </div>
              <span class="reading-item__status" :class="`reading-item__status--${reading.status ?? 'pending'}`">
                {{ $t(`usage.readingStatus.${reading.status ?? 'pending'}`) }}
              </span>
            </div>
          </template>
          <EmptyState
            v-else
            icon="las la-history"
            :title="$t('usage.noReadings')"
          />
        </div>
      </div>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import EmptyState from 'src/components/ui/EmptyState.vue';
import type { MeterReading } from 'src/types';

defineProps<{
  meterOptions: { label: string; value: string }[];
  selectedMeterUnit: string;
  readings: MeterReading[];
  isSubmitting: boolean;
}>();

const emit = defineEmits<{
  'submit-reading': [payload: { meter_id: string; reading: number; reading_date?: string; notes?: string }];
}>();

const showSubmitDialog = ref(false);
const showHistoryDialog = ref(false);

const readingForm = reactive({
  meter_id: null as string | null,
  reading: null as number | null,
  reading_date: new Date().toISOString().split('T')[0],
  notes: '',
});

function handleSubmitReading(): void {
  if (!readingForm.meter_id || readingForm.reading === null) return;

  emit('submit-reading', {
    meter_id: readingForm.meter_id,
    reading: readingForm.reading,
    ...(readingForm.reading_date ? { reading_date: readingForm.reading_date } : {}),
    ...(readingForm.notes ? { notes: readingForm.notes } : {}),
  });

  showSubmitDialog.value = false;
  readingForm.reading = null;
  readingForm.notes = '';
}

function getReadingStatusIcon(status: string): string {
  switch (status) {
    case 'approved': return 'las la-check';
    case 'pending': return 'las la-clock';
    case 'rejected': return 'las la-times';
    default: return 'las la-question';
  }
}

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
</script>

<style lang="sass" scoped>
$primary: #0066FF
$positive: #10B981
$negative: #EF4444
$warning: #F59E0B
$gray-100: #F1F5F9
$gray-200: #E2E8F0
$gray-500: #64748B
$gray-600: #475569
$gray-700: #334155
$gray-900: #0F172A
$radius-md: 12px
$radius-full: 9999px
$radius-xl: 20px

.usage-filters
  margin-bottom: 24px

.quick-actions
  display: grid
  grid-template-columns: 1fr 1fr
  gap: 12px

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
      border-color: darken($gray-200, 10%)

  &:active
    transform: scale(0.98)

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
</style>
