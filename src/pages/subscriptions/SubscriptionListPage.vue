<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">{{ $t('subscriptions.title') }}</div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <!-- Subscription List -->
    <template v-else>
      <div class="row q-col-gutter-md">
        <div
          v-for="subscription in subscriptions"
          :key="subscription.id"
          class="col-12 col-md-6"
        >
          <q-card
            class="subscription-card cursor-pointer"
            @click="goToSubscription(subscription.id)"
          >
            <q-card-section>
              <div class="row items-center q-gutter-md">
                <q-icon
                  :name="getUtilityIcon(subscription.group)"
                  :color="getUtilityColor(subscription.group)"
                  size="48px"
                />
                <div class="col">
                  <div class="text-h6">{{ $t(`utilities.${subscription.group}`) }}</div>
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
              <div class="row q-col-gutter-sm text-body2">
                <div class="col-12" v-if="subscription.address?.full_address">
                  <q-icon name="las la-map-marker" class="q-mr-xs" />
                  {{ subscription.address.full_address }}
                </div>
                <div class="col-12" v-if="subscription.lastUsage">
                  <q-icon name="las la-chart-line" class="q-mr-xs" />
                  {{ $t('subscriptions.lastReading') }}:
                  {{ subscription.lastUsage.consumption }} {{ subscription.lastUsage.unit }}
                  <span class="text-caption text-grey q-ml-xs">
                    ({{ formatDate(subscription.lastUsage.reading_end_date || '') }})
                  </span>
                </div>
              </div>
            </q-card-section>

            <q-card-actions>
              <q-btn flat color="primary" :label="$t('common.viewDetails')" />
              <q-space />
              <q-btn flat color="grey" icon="las la-chart-bar" :label="$t('subscriptions.usage')" />
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <!-- No Subscriptions -->
      <q-card v-if="subscriptions.length === 0" flat bordered>
        <q-card-section class="text-center text-grey q-pa-xl">
          <q-icon name="las la-clipboard-list" size="64px" class="q-mb-md" />
          <div class="text-h6">{{ $t('subscriptions.noSubscriptions') }}</div>
        </q-card-section>
      </q-card>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useEntityStore } from 'src/stores/entity';
import { subscriptionService } from 'src/services/subscription.service';
import type { Subscription } from 'src/types';

const router = useRouter();
const entityStore = useEntityStore();

const isLoading = ref(true);
const subscriptions = ref<Subscription[]>([]);

async function loadSubscriptions(): Promise<void> {
  if (!entityStore.selectedEntityId) return;

  isLoading.value = true;

  try {
    subscriptions.value = await subscriptionService.getSubscriptions(
      entityStore.selectedEntityId,
      { include: 'lastUsage,address' }
    );
  } catch (error) {
    console.error('Failed to load subscriptions:', error);
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

function goToSubscription(id: string): void {
  void router.push(`/subscriptions/${id}`);
}

watch(() => entityStore.selectedEntityId, () => {
  if (entityStore.selectedEntityId) {
    void loadSubscriptions();
  }
}, { immediate: true });

onMounted(() => {
  if (entityStore.selectedEntityId) {
    void loadSubscriptions();
  }
});
</script>

<style lang="sass" scoped>
.subscription-card
  transition: transform 0.2s, box-shadow 0.2s

  &:hover
    transform: translateY(-2px)
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
</style>
