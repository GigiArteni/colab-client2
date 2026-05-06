<template>
  <q-page padding>
    <!-- Back Button & Title -->
    <div class="row items-center q-mb-md">
      <q-btn flat icon="las la-arrow-left" @click="goBack" />
      <div class="text-h5 q-ml-sm">{{ $t('meters.submitReading') }}</div>
    </div>

    <!-- Loading -->
    <div v-if="isLoadingMeter" class="flex flex-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <template v-else-if="meter">
      <div class="row q-col-gutter-md">
        <!-- Meter Info Summary -->
        <div class="col-12 col-md-4">
          <q-card>
            <q-card-section>
              <div class="row items-center q-gutter-md q-mb-md">
                <q-icon name="las la-tachometer-alt" color="orange" size="40px" />
                <div class="col">
                  <div class="text-subtitle1 text-weight-medium">{{ meter.serial_number }}</div>
                  <div class="text-caption text-grey">{{ $t(`meters.types.${meter.type}`) }}</div>
                </div>
              </div>

              <q-list dense>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>{{ $t('meters.previousIndex') }}</q-item-label>
                    <q-item-label class="text-h6">
                      {{ formatNumber(meter.current_index) }} m³
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="meter.last_reading_date">
                  <q-item-section>
                    <q-item-label caption>{{ $t('meters.lastReading') }}</q-item-label>
                    <q-item-label>{{ formatDate(meter.last_reading_date) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <!-- Tips Card -->
          <q-card class="q-mt-md">
            <q-card-section>
              <div class="text-subtitle2 q-mb-sm">
                <q-icon name="las la-lightbulb" class="q-mr-xs" />
                {{ $t('meters.tips.title') }}
              </div>
              <ul class="q-pl-md q-my-none text-body2 text-grey-8">
                <li>{{ $t('meters.tips.tip1') }}</li>
                <li>{{ $t('meters.tips.tip2') }}</li>
                <li>{{ $t('meters.tips.tip3') }}</li>
              </ul>
            </q-card-section>
          </q-card>
        </div>

        <!-- Reading Form -->
        <div class="col-12 col-md-8">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ $t('meters.enterReading') }}</div>

              <q-form @submit.prevent="submitReading" class="q-gutter-md">
                <!-- Current Index Input -->
                <q-input
                  v-model.number="form.current_index"
                  type="number"
                  step="0.01"
                  :label="$t('meters.currentIndex')"
                  :hint="$t('meters.currentIndexHint')"
                  suffix="m³"
                  outlined
                  :rules="[
                    (val) => val !== null && val !== '' || $t('validation.required'),
                    (val) => val >= (meter?.current_index || 0) || $t('meters.validation.indexMustBeHigher'),
                    (val) => val <= (meter?.current_index || 0) + 10000 || $t('meters.validation.indexTooHigh'),
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="las la-digital-tachograph" />
                  </template>
                </q-input>

                <!-- Calculated Consumption -->
                <q-banner v-if="calculatedConsumption !== null" class="bg-positive text-white">
                  <template v-slot:avatar>
                    <q-icon name="las la-chart-line" />
                  </template>
                  <div class="text-subtitle1">
                    {{ $t('meters.estimatedConsumption') }}:
                    <span class="text-weight-bold">{{ formatNumber(calculatedConsumption) }} m³</span>
                  </div>
                </q-banner>

                <!-- Warning if consumption seems unusual -->
                <q-banner
                  v-if="consumptionWarning"
                  class="bg-warning text-dark"
                >
                  <template v-slot:avatar>
                    <q-icon name="las la-exclamation-triangle" />
                  </template>
                  {{ consumptionWarning }}
                </q-banner>

                <!-- Reading Date -->
                <q-input
                  v-model="form.reading_date"
                  type="date"
                  :label="$t('meters.readingDate')"
                  outlined
                  :max="today"
                >
                  <template v-slot:prepend>
                    <q-icon name="las la-calendar" />
                  </template>
                </q-input>

                <!-- Notes -->
                <q-input
                  v-model="form.notes"
                  type="textarea"
                  :label="$t('meters.notes')"
                  :hint="$t('meters.notesHint')"
                  outlined
                  autogrow
                  :maxlength="500"
                >
                  <template v-slot:prepend>
                    <q-icon name="las la-sticky-note" />
                  </template>
                </q-input>

                <!-- Submit Button -->
                <div class="row justify-end q-gutter-sm q-mt-lg">
                  <q-btn
                    flat
                    :label="$t('common.cancel')"
                    @click="goBack"
                  />
                  <q-btn
                    type="submit"
                    color="positive"
                    icon="las la-check"
                    :label="$t('meters.submitReading')"
                    :loading="isSubmitting"
                    :disable="!isFormValid"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>

    <!-- Not Found -->
    <q-card v-else flat bordered>
      <q-card-section class="text-center text-grey q-pa-xl">
        <q-icon name="las la-exclamation-triangle" size="64px" class="q-mb-md" />
        <div class="text-h6">{{ $t('meters.notFound') }}</div>
      </q-card-section>
    </q-card>

    <!-- Success Dialog -->
    <q-dialog v-model="showSuccessDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="text-center">
          <q-icon name="las la-check-circle" color="positive" size="64px" />
          <div class="text-h6 q-mt-md">{{ $t('meters.readingSubmitted') }}</div>
          <div class="text-body2 text-grey q-mt-sm">
            {{ $t('meters.readingSubmittedDescription') }}
          </div>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn
            color="primary"
            :label="$t('meters.backToMeter')"
            @click="goToMeterDetail"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useEntityStore } from 'src/stores/entity';
import { useMeterStore } from 'src/stores/meter';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const $q = useQuasar();
const entityStore = useEntityStore();
const meterStore = useMeterStore();

const showSuccessDialog = ref(false);

const form = reactive({
  current_index: null as number | null,
  reading_date: new Date().toISOString().split('T')[0],
  notes: '',
});

const meterId = computed(() => route.params.meterId as string);
const meter = computed(() => meterStore.selectedMeter);
const isLoadingMeter = computed(() => meterStore.isLoadingMeter);
const isSubmitting = computed(() => meterStore.isSubmitting);

const today = computed(() => new Date().toISOString().split('T')[0]);

const calculatedConsumption = computed(() => {
  if (form.current_index === null || meter.value?.current_index === undefined) {
    return null;
  }
  const consumption = form.current_index - (meter.value.current_index || 0);
  return consumption >= 0 ? consumption : null;
});

const consumptionWarning = computed(() => {
  if (calculatedConsumption.value === null) return null;

  // Warning if consumption is unusually high (> 500 m³)
  if (calculatedConsumption.value > 500) {
    return t('meters.warnings.highConsumption');
  }

  // Warning if consumption is 0
  if (calculatedConsumption.value === 0) {
    return t('meters.warnings.zeroConsumption');
  }

  return null;
});

const isFormValid = computed(() => {
  if (form.current_index === null) return false;
  if (meter.value?.current_index !== undefined && form.current_index < meter.value.current_index) {
    return false;
  }
  return true;
});

async function loadMeter(): Promise<void> {
  if (!entityStore.selectedEntityId || !meterId.value) return;

  try {
    await meterStore.fetchMeter(entityStore.selectedEntityId, meterId.value);
  } catch (error) {
    console.error('Failed to load meter:', error);
  }
}

async function submitReading(): Promise<void> {
  if (!entityStore.selectedEntityId || !meterId.value || !meter.value?.subscription_id) {
    return;
  }

  if (form.current_index === null) return;

  try {
    const readingPayload: { current_index: number; reading_date?: string; notes?: string } = {
      current_index: form.current_index,
    };
    if (form.reading_date) readingPayload.reading_date = form.reading_date;
    if (form.notes) readingPayload.notes = form.notes;
    await meterStore.submitReading(
      entityStore.selectedEntityId,
      meter.value.subscription_id,
      meterId.value,
      readingPayload
    );

    showSuccessDialog.value = true;
  } catch (error: unknown) {
    console.error('Failed to submit reading:', error);

    $q.notify({
      type: 'negative',
      message: t('meters.submitError'),
      caption: (error as Error)?.message || t('common.tryAgain'),
    });
  }
}

function formatNumber(value: number | undefined): string {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('ro-RO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(date: string): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function goBack(): void {
  void router.push(`/meters/${meterId.value}`);
}

function goToMeterDetail(): void {
  showSuccessDialog.value = false;
  void router.push(`/meters/${meterId.value}`);
}

watch(
  () => [entityStore.selectedEntityId, meterId.value],
  () => {
    if (entityStore.selectedEntityId && meterId.value) {
      void loadMeter();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (entityStore.selectedEntityId && meterId.value) {
    void loadMeter();
  }
});
</script>
