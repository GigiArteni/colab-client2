<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5">{{ $t('meters.title') }}</div>
      <q-space />
      <!-- Status Counts -->
      <div v-if="statusCounts" class="row q-gutter-sm">
        <q-chip
          color="positive"
          text-color="white"
          :label="`${statusCounts.active} ${$t('meters.status.active')}`"
        />
        <q-chip
          color="grey"
          text-color="white"
          :label="`${statusCounts.total} ${$t('meters.total')}`"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <!-- Meter List -->
    <template v-else>
      <div class="row q-col-gutter-md">
        <div
          v-for="meter in meters"
          :key="meter.id"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-card class="meter-card">
            <q-card-section>
              <div class="row items-center q-gutter-md">
                <q-icon
                  name="las la-tachometer-alt"
                  color="orange"
                  size="40px"
                />
                <div class="col">
                  <div class="text-subtitle1 text-weight-medium">
                    {{ meter.serial_number }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ $t(`meters.types.${meter.type}`) }}
                  </div>
                </div>
                <q-chip
                  :color="getStatusColor(meter.status)"
                  text-color="white"
                  size="sm"
                  :label="$t(`meters.status.${meter.status}`)"
                />
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
              <div class="row q-col-gutter-sm text-body2">
                <div class="col-12" v-if="meter.current_index !== undefined">
                  <q-icon name="las la-digital-tachograph" class="q-mr-xs" />
                  {{ $t('meters.currentIndex') }}:
                  <span class="text-weight-medium">{{ formatNumber(meter.current_index) }} m³</span>
                </div>
                <div class="col-12" v-if="meter.last_reading_date">
                  <q-icon name="las la-calendar" class="q-mr-xs" />
                  {{ $t('meters.lastReading') }}:
                  <span class="text-caption text-grey">{{ formatDate(meter.last_reading_date) }}</span>
                </div>
                <div class="col-12" v-if="meter.installed_date">
                  <q-icon name="las la-tools" class="q-mr-xs" />
                  {{ $t('meters.installedDate') }}:
                  <span class="text-caption text-grey">{{ formatDate(meter.installed_date) }}</span>
                </div>
              </div>
            </q-card-section>

            <q-card-actions>
              <q-btn
                flat
                color="primary"
                :label="$t('common.viewDetails')"
                @click="goToMeter(meter.id)"
              />
              <q-space />
              <q-btn
                v-if="meter.status === 'active'"
                flat
                color="positive"
                icon="las la-plus"
                :label="$t('meters.submitReading')"
                @click="goToSubmitReading(meter.id)"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <!-- No Meters -->
      <q-card v-if="meters.length === 0" flat bordered>
        <q-card-section class="text-center text-grey q-pa-xl">
          <q-icon name="las la-tachometer-alt" size="64px" class="q-mb-md" />
          <div class="text-h6">{{ $t('meters.noMeters') }}</div>
          <div class="text-caption">{{ $t('meters.noMetersDescription') }}</div>
        </q-card-section>
      </q-card>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { watch, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useEntityStore } from 'src/stores/entity';
import { useMeterStore } from 'src/stores/meter';

const router = useRouter();
const entityStore = useEntityStore();
const meterStore = useMeterStore();

const isLoading = computed(() => meterStore.isLoading);
const meters = computed(() => meterStore.gasMeters);
const statusCounts = computed(() => meterStore.statusCounts);

async function loadMeters(): Promise<void> {
  if (!entityStore.selectedEntityId) return;

  try {
    await Promise.all([
      meterStore.fetchMeters(entityStore.selectedEntityId, { group: 'natural-gas' }),
      meterStore.fetchStatusCounts(entityStore.selectedEntityId, 'natural-gas'),
    ]);
  } catch (error) {
    console.error('Failed to load meters:', error);
  }
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'positive',
    pending: 'warning',
    detached: 'grey',
    replaced: 'info',
    decommissioned: 'negative',
  };
  return colors[status] || 'grey';
}

function formatNumber(value: number | undefined): string {
  if (value === undefined) return '-';
  return new Intl.NumberFormat('ro-RO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function goToMeter(meterId: string): void {
  void router.push(`/meters/${meterId}`);
}

function goToSubmitReading(meterId: string): void {
  void router.push(`/meters/${meterId}/submit-reading`);
}

watch(
  () => entityStore.selectedEntityId,
  () => {
    if (entityStore.selectedEntityId) {
      void loadMeters();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (entityStore.selectedEntityId) {
    void loadMeters();
  }
});
</script>

<style lang="sass" scoped>
.meter-card
  transition: transform 0.2s, box-shadow 0.2s

  &:hover
    transform: translateY(-2px)
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
</style>
