<template>
  <div class="alert-types-list">
    <!-- Category bulk actions -->
    <div class="category-actions">
      <q-btn
        flat dense size="sm" color="positive"
        icon="las la-check-circle" :label="$t('alertPreferences.enableAll')"
        class="q-mr-sm"
        @click="emit('enable-all')"
      />
      <q-btn
        flat dense size="sm" color="negative"
        icon="las la-ban" :label="$t('alertPreferences.disableAll')"
        @click="emit('disable-all')"
      />
    </div>

    <!-- Alert type cards -->
    <q-card
      v-for="alertType in alertTypes"
      :key="alertType.id"
      flat bordered
      class="alert-type-card q-mb-md"
    >
      <q-card-section class="alert-type-header">
        <div class="row items-center">
          <div class="col">
            <div class="alert-type-name">{{ alertType.name }}</div>
            <div class="alert-type-description">
              {{ alertType.description || 'Fără descriere' }}
            </div>
            <div class="alert-type-meta q-mt-xs">
              <q-badge
                :color="priorityColor(alertType.priority)"
                :label="priorityLabel(alertType.priority)"
                size="sm"
              />
            </div>
          </div>
          <div class="col-auto">
            <q-chip
              v-if="hasAnyChannel(alertType.id)"
              color="positive" text-color="white"
              icon="las la-check" size="sm"
            >
              Activ
            </q-chip>
            <q-chip
              v-else
              color="grey-5" text-color="white"
              icon="las la-ban" size="sm"
            >
              Inactiv
            </q-chip>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="channel-toggles">
        <div class="text-caption text-grey-7 q-mb-sm">Canale de notificare:</div>
        <AlertChannelToggle
          :alert-type-id="alertType.id"
          :channels="channels"
          :preference="preferences.get(alertType.id)"
          @toggle="(id, ch) => emit('toggle', id, ch)"
        />
      </q-card-section>
    </q-card>

    <!-- Empty state -->
    <div v-if="alertTypes.length === 0" class="empty-state">
      <q-icon name="las la-inbox" size="64px" color="grey-5" />
      <div class="text-h6 q-mt-md text-grey-7">Nu există tipuri de alerte</div>
      <div class="text-caption text-grey-6">Pentru această categorie</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AlertChannelToggle from './AlertChannelToggle.vue';
import type { AlertType, ChannelInfo } from 'src/types/alertPreference.types';

interface ChannelState {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  print: boolean;
  in_app: boolean;
  [key: string]: unknown;
}

const props = defineProps<{
  alertTypes: AlertType[];
  channels: ChannelInfo[];
  preferences: Map<string, ChannelState>;
}>();

const emit = defineEmits<{
  toggle: [alertTypeId: string, channel: string];
  'enable-all': [];
  'disable-all': [];
}>();

function hasAnyChannel(alertTypeId: string): boolean {
  const pref = props.preferences.get(alertTypeId);
  if (!pref) return false;
  return pref.email || pref.sms || pref.whatsapp || pref.print || pref.in_app;
}

function priorityColor(priority: string): string {
  const map: Record<string, string> = {
    urgent: 'negative', high: 'orange', normal: 'primary', low: 'grey-6',
  };
  return map[priority?.toLowerCase()] ?? 'grey-6';
}

function priorityLabel(priority: string): string {
  const map: Record<string, string> = {
    urgent: 'Urgent', high: 'Mare', normal: 'Normal', low: 'Scăzută',
  };
  return map[priority?.toLowerCase()] ?? priority;
}
</script>

<style lang="sass" scoped>
.category-actions
  display: flex
  justify-content: flex-start
  padding: var(--space-sm) 0 var(--space-md) 0
  gap: var(--space-xs)

.alert-types-list
  padding-bottom: var(--space-md)

.alert-type-card
  background: var(--color-surface)
  border-radius: var(--radius-lg)
  overflow: hidden

.alert-type-header
  padding: var(--space-md)

.alert-type-name
  font-size: 1rem
  font-weight: 600
  color: var(--color-text-primary)
  line-height: 1.4

.alert-type-description
  font-size: 0.875rem
  color: var(--color-text-secondary)
  line-height: 1.4
  margin-top: 4px

.alert-type-meta
  display: flex
  gap: var(--space-xs)

.channel-toggles
  padding: var(--space-md)
  background: rgba(0, 0, 0, 0.02)

.empty-state
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  padding: var(--space-2xl) var(--space-md)
  text-align: center
</style>
