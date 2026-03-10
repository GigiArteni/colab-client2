<template>
  <q-page padding>
    <!-- Back Button & Title -->
    <div class="row items-center q-mb-md">
      <q-btn flat icon="las la-arrow-left" @click="goBack" />
      <div class="text-h5 q-ml-sm">{{ $t('meters.details') }}</div>
      <q-space />
      <q-btn
        v-if="meter?.status === 'active'"
        color="positive"
        icon="las la-plus"
        :label="$t('meters.submitReading')"
        @click="goToSubmitReading"
      />
    </div>

    <!-- Loading -->
    <div v-if="isLoadingMeter" class="flex flex-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <template v-else-if="meter">
      <div class="row q-col-gutter-md">
        <!-- Meter Info Card -->
        <div class="col-12 col-md-4">
          <q-card>
            <q-card-section>
              <div class="row items-center q-gutter-md q-mb-md">
                <q-icon name="las la-tachometer-alt" color="orange" size="48px" />
                <div class="col">
                  <div class="text-h6">{{ meter.serial_number }}</div>
                  <q-chip
                    :color="getStatusColor(meter.status)"
                    text-color="white"
                    size="sm"
                    :label="$t(`meters.status.${meter.status}`)"
                  />
                </div>
              </div>

              <q-list dense separator>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>{{ $t('meters.type') }}</q-item-label>
                    <q-item-label>{{ $t(`meters.types.${meter.type}`) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="meter.manufacturer">
                  <q-item-section>
                    <q-item-label caption>{{ $t('meters.manufacturer') }}</q-item-label>
                    <q-item-label>{{ meter.manufacturer }} {{ meter.model }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="meter.current_index !== undefined">
                  <q-item-section>
                    <q-item-label caption>{{ $t('meters.currentIndex') }}</q-item-label>
                    <q-item-label class="text-weight-bold text-h6">
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

                <q-item v-if="meter.installed_date">
                  <q-item-section>
                    <q-item-label caption>{{ $t('meters.installedDate') }}</q-item-label>
                    <q-item-label>{{ formatDate(meter.installed_date) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="meter.verification_date">
                  <q-item-section>
                    <q-item-label caption>{{ $t('meters.verificationDate') }}</q-item-label>
                    <q-item-label>{{ formatDate(meter.verification_date) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="meter.seal_number">
                  <q-item-section>
                    <q-item-label caption>{{ $t('meters.sealNumber') }}</q-item-label>
                    <q-item-label>{{ meter.seal_number }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>

        <!-- Tabs: Readings & Activities -->
        <div class="col-12 col-md-8">
          <q-card>
            <q-tabs
              v-model="activeTab"
              dense
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              align="left"
            >
              <q-tab name="readings" :label="$t('meters.readingHistory')" />
              <q-tab name="activities" :label="$t('meters.activities')" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="activeTab" animated>
              <!-- Readings Tab -->
              <q-tab-panel name="readings">
                <div v-if="isLoadingReadings" class="flex flex-center q-pa-lg">
                  <q-spinner-dots size="40px" color="primary" />
                </div>

                <template v-else>
                  <q-table
                    :rows="readings"
                    :columns="readingColumns"
                    row-key="id"
                    flat
                    bordered
                    :rows-per-page-options="[10, 20, 50]"
                    :no-data-label="$t('meters.noReadings')"
                  >
                    <template v-slot:body-cell-consumption="props">
                      <q-td :props="props">
                        <span class="text-weight-medium text-positive">
                          {{ formatNumber(props.row.usage_m3 || 0) }} m³
                        </span>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-source="props">
                      <q-td :props="props">
                        <q-chip
                          size="sm"
                          :color="getSourceColor(props.row.reading_source)"
                          text-color="white"
                        >
                          {{ $t(`meters.readingSource.${props.row.reading_source || 'manual'}`) }}
                        </q-chip>
                      </q-td>
                    </template>
                  </q-table>
                </template>
              </q-tab-panel>

              <!-- Activities Tab -->
              <q-tab-panel name="activities">
                <div v-if="isLoadingActivities" class="flex flex-center q-pa-lg">
                  <q-spinner-dots size="40px" color="primary" />
                </div>

                <template v-else>
                  <q-timeline color="primary">
                    <q-timeline-entry
                      v-for="activity in activities"
                      :key="activity.id"
                      :subtitle="formatDateTime(activity.created_at)"
                      :icon="getActivityIcon(activity.type)"
                    >
                      <template v-slot:title>
                        <span class="text-weight-medium">{{ activity.type_label }}</span>
                        <span v-if="activity.causer" class="text-caption text-grey q-ml-sm">
                          {{ $t('common.by') }} {{ activity.causer.name }}
                        </span>
                      </template>
                      <div v-if="activity.content" class="text-body2 text-grey-8">
                        {{ activity.content }}
                      </div>
                    </q-timeline-entry>
                  </q-timeline>

                  <div v-if="activities.length === 0" class="text-center text-grey q-pa-lg">
                    <q-icon name="las la-history" size="48px" class="q-mb-sm" />
                    <div>{{ $t('meters.noActivities') }}</div>
                  </div>

                  <!-- Load More -->
                  <div
                    v-if="activitiesPagination.page < activitiesPagination.lastPage"
                    class="flex flex-center q-mt-md"
                  >
                    <q-btn
                      flat
                      color="primary"
                      :loading="isLoadingActivities"
                      :label="$t('common.loadMore')"
                      @click="loadMoreActivities"
                    />
                  </div>
                </template>
              </q-tab-panel>
            </q-tab-panels>
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
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useEntityStore } from 'src/stores/entity';
import { useMeterStore } from 'src/stores/meter';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const entityStore = useEntityStore();
const meterStore = useMeterStore();

const activeTab = ref('readings');

const meterId = computed(() => route.params.meterId as string);
const meter = computed(() => meterStore.selectedMeter);
const readings = computed(() => meterStore.readings);
const activities = computed(() => meterStore.activities);
const isLoadingMeter = computed(() => meterStore.isLoadingMeter);
const isLoadingReadings = computed(() => meterStore.isLoadingReadings);
const isLoadingActivities = computed(() => meterStore.isLoadingActivities);
const activitiesPagination = computed(() => meterStore.activitiesPagination);

const readingColumns = computed(() => [
  {
    name: 'date',
    label: t('meters.readingDate'),
    field: 'reading_end_date',
    format: (val: string) => formatDate(val),
    align: 'left' as const,
  },
  {
    name: 'previous',
    label: t('meters.previousIndex'),
    field: 'previous_index',
    format: (val: number) => formatNumber(val),
    align: 'right' as const,
  },
  {
    name: 'current',
    label: t('meters.currentIndex'),
    field: 'current_index',
    format: (val: number) => formatNumber(val),
    align: 'right' as const,
  },
  {
    name: 'consumption',
    label: t('meters.consumption'),
    field: 'usage_m3',
    align: 'right' as const,
  },
  {
    name: 'source',
    label: t('meters.source'),
    field: 'reading_source',
    align: 'center' as const,
  },
]);

async function loadMeterData(): Promise<void> {
  if (!entityStore.selectedEntityId || !meterId.value) return;

  try {
    await meterStore.fetchMeter(entityStore.selectedEntityId, meterId.value);

    if (meter.value?.subscription_id) {
      await meterStore.fetchReadings(
        entityStore.selectedEntityId,
        meter.value.subscription_id,
        meterId.value
      );
    }

    await meterStore.fetchActivities(entityStore.selectedEntityId, meterId.value);
  } catch (error) {
    console.error('Failed to load meter data:', error);
  }
}

async function loadMoreActivities(): Promise<void> {
  if (!entityStore.selectedEntityId || !meterId.value) return;

  await meterStore.fetchActivities(
    entityStore.selectedEntityId,
    meterId.value,
    activitiesPagination.value.page + 1
  );
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

function getSourceColor(source: string): string {
  const colors: Record<string, string> = {
    customer: 'positive',
    manual: 'primary',
    automatic: 'info',
    estimated: 'warning',
  };
  return colors[source] || 'grey';
}

function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    'meter.created': 'las la-plus-circle',
    'meter.updated': 'las la-edit',
    'meter.attached': 'las la-link',
    'meter.detached': 'las la-unlink',
    'meter.replaced': 'las la-exchange-alt',
    'meter.status_changed': 'las la-sync',
    'meter.reading_updated': 'las la-digital-tachograph',
    created: 'las la-plus-circle',
    updated: 'las la-edit',
  };
  return icons[type] || 'las la-history';
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

function formatDateTime(date: string): string {
  if (!date) return '-';
  return new Date(date).toLocaleString('ro-RO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function goBack(): void {
  void router.push('/meters');
}

function goToSubmitReading(): void {
  void router.push(`/meters/${meterId.value}/submit-reading`);
}

watch(
  () => [entityStore.selectedEntityId, meterId.value],
  () => {
    if (entityStore.selectedEntityId && meterId.value) {
      void loadMeterData();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (entityStore.selectedEntityId && meterId.value) {
    void loadMeterData();
  }
});

onUnmounted(() => {
  meterStore.clearSelectedMeter();
});
</script>
