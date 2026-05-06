<template>
  <q-page class="alert-preferences-page">
    <!-- Header -->
    <q-header elevated class="bg-white text-dark">
      <q-toolbar>
        <q-btn
          flat
          round
          dense
          icon="las la-arrow-left"
          @click="router.back()"
        />
        <q-toolbar-title>{{ $t('alertPreferences.title') }}</q-toolbar-title>
        <q-btn
          flat
          round
          dense
          icon="las la-question-circle"
          @click="showHelp = true"
        />
      </q-toolbar>
    </q-header>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <q-spinner-dots color="primary" size="50px" />
      <div class="text-grey-7 q-mt-md">Se încarcă preferințele...</div>
    </div>

    <!-- Content -->
    <div v-else class="preferences-content">
      <!-- Browser Notifications Section -->
      <q-card flat bordered class="browser-notifications-card q-mb-md">
        <q-card-section>
          <div class="row items-center">
            <q-icon name="las la-desktop" size="32px" color="primary" class="q-mr-md" />
            <div class="col">
              <div class="text-subtitle1 text-weight-medium">Notificări Browser</div>
              <div class="text-caption text-grey-7">
                Primește notificări pe desktop chiar dacă aplicația nu este deschisă
              </div>
            </div>
            <q-toggle
              :model-value="browserNotifications.isEnabled.value"
              :disable="!browserNotifications.isSupported.value || browserNotifications.permission.value === 'denied'"
              color="primary"
              @update:model-value="handleBrowserNotificationToggle"
            />
          </div>
        </q-card-section>

        <q-separator v-if="browserNotifications.permission.value === 'default' || browserNotifications.permission.value === 'denied'" />

        <q-card-section v-if="browserNotifications.permission.value === 'default'">
          <q-btn
            unelevated
            color="primary"
            icon="las la-bell"
            :label="$t('alertPreferences.enableBrowser')"
            @click="handleRequestPermission"
            class="full-width"
          />
        </q-card-section>

        <q-card-section v-else-if="browserNotifications.permission.value === 'denied'">
          <q-banner dense class="bg-warning text-white" rounded>
            <template #avatar>
              <q-icon name="las la-exclamation-triangle" />
            </template>
            Notificările au fost blocate. Activează-le din setările browser-ului.
          </q-banner>
        </q-card-section>
      </q-card>

      <!-- Tabs + category preference list -->
      <AlertPreferenceList
        v-model:selected-category="selectedCategory"
        :categories="categories"
        :channels="channels"
        :alert-types="alertTypes"
        :preferences="preferences"
        @toggle="toggleChannel"
        @enable-all="enableAllInCategory"
        @disable-all="disableAllInCategory"
      />
    </div>

    <!-- Fixed Save Button -->
    <div v-if="!loading" class="save-button-container">
      <q-btn
        unelevated
        color="primary"
        icon="las la-save"
        :label="$t('alertPreferences.save')"
        :loading="saving"
        @click="savePreferences"
        class="full-width save-button"
        size="lg"
      />
    </div>

    <!-- Help Dialog -->
    <q-dialog v-model="showHelp">
      <q-card style="min-width: 320px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Ajutor - Preferințe Notificări</div>
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Canale disponibile:</div>
          <q-list dense>
            <q-item v-for="channel in channels" :key="channel.value">
              <q-item-section avatar>
                <q-icon :name="channel.icon" :color="channel.color" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ channel.label }}</q-item-label>
                <q-item-label caption>{{ getChannelDescription(channel.value) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div class="text-subtitle2 q-mt-md q-mb-sm">Categorii de alerte:</div>
          <div class="text-caption text-grey-7">
            Puteți configura preferințele pentru fiecare tip de alertă în parte.
            Activați sau dezactivați canalele dorite pentru a primi notificări.
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Închide" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useEntityStore } from 'src/stores/entity';
import { useProfileStore } from 'src/stores/profile';
import { useBrowserNotifications } from 'src/composables/useBrowserNotifications';
import * as alertPreferenceService from 'src/services/alertPreference.service';
import AlertPreferenceList from './alerts/components/AlertPreferenceList.vue';
import type {
  AlertType,
  AlertPreference,
  AlertPreferenceUpdate,
  AlertCategory,
  CategoryInfo,
  ChannelInfo,
} from 'src/types/alertPreference.types';

const router = useRouter();
const $q = useQuasar();
const entityStore = useEntityStore();
const profileStore = useProfileStore();
const browserNotifications = useBrowserNotifications();

// State
const loading = ref(false);
const saving = ref(false);
const showHelp = ref(false);
const selectedCategory = ref<AlertCategory>('invoice');
const alertTypes = ref<AlertType[]>([]);
const preferences = ref(new Map<string, {
  id?: string;
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  print: boolean;
  in_app: boolean;
}>());

// Categories definition
const categories: CategoryInfo[] = [
  { value: 'invoice', label: 'Facturi', icon: 'las la-file-invoice-dollar', color: 'blue' },
  { value: 'payment', label: 'Plăți', icon: 'las la-credit-card', color: 'green' },
  { value: 'subscription', label: 'Abonamente', icon: 'las la-file-contract', color: 'teal' },
  { value: 'meter', label: 'Contoare', icon: 'las la-tachometer-alt', color: 'indigo' },
  { value: 'inspection', label: 'Inspecții', icon: 'las la-clipboard-check', color: 'cyan' },
  { value: 'usage', label: 'Consum', icon: 'las la-chart-bar', color: 'purple' },
  { value: 'disconnection', label: 'Deconectări', icon: 'las la-plug', color: 'red' },
  { value: 'compliance', label: 'Conformitate', icon: 'las la-gavel', color: 'brown' },
  { value: 'subsidy', label: 'Subvenții', icon: 'las la-hand-holding-usd', color: 'amber' },
  { value: 'general', label: 'General', icon: 'las la-bell', color: 'grey' },
];

// Channels definition
const channels: ChannelInfo[] = [
  { value: 'email', label: 'Email', icon: 'las la-envelope', color: 'blue' },
  { value: 'sms', label: 'SMS', icon: 'las la-sms', color: 'purple' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'lab la-whatsapp', color: 'green' },
  { value: 'in_app', label: 'În Aplicație', icon: 'las la-bell', color: 'orange' },
];

function notify(type: 'positive' | 'negative' | 'info' | 'warning', message: string) {
  $q.notify({ type, message, icon: type === 'negative' || type === 'warning' ? 'las la-exclamation-triangle' : 'las la-check', position: 'top' });
}

async function loadData() {
  loading.value = true;
  try {
    const entityId = entityStore.selectedEntityId;
    const contactId = profileStore.contact?.id;
    if (!entityId || !contactId) throw new Error('Missing entity or contact ID');

    alertTypes.value = await alertPreferenceService.getAlertTypes(entityId);
    const prefs = await alertPreferenceService.getContactPreferences(entityId, contactId);

    preferences.value = new Map();
    prefs.forEach((pref: AlertPreference) => {
      const entry: { id?: string; email: boolean; sms: boolean; whatsapp: boolean; print: boolean; in_app: boolean } = {
        email: pref.email_enabled, sms: pref.sms_enabled,
        whatsapp: pref.whatsapp_enabled, print: pref.print_enabled, in_app: pref.in_app_enabled,
      };
      if (pref.id !== undefined) entry.id = pref.id;
      preferences.value.set(pref.alert_type_id, entry);
    });
    alertTypes.value.forEach((at: AlertType) => {
      if (!preferences.value.has(at.id)) {
        preferences.value.set(at.id, { email: true, sms: false, whatsapp: false, print: false, in_app: true });
      }
    });
  } catch (error) {
    console.error('Error loading alert preferences:', error);
    notify('negative', 'Eroare la încărcarea preferințelor');
  } finally {
    loading.value = false;
  }
}

function toggleChannel(alertTypeId: string, channel: string) {
  const pref = preferences.value.get(alertTypeId) ?? { email: false, sms: false, whatsapp: false, print: false, in_app: false };
  (pref as Record<string, unknown>)[channel] = !(pref as Record<string, unknown>)[channel];
  preferences.value.set(alertTypeId, pref);
}

function enableAllInCategory(category: AlertCategory) {
  alertTypes.value.filter((at: AlertType) => at.category === category).forEach((at: AlertType) => {
    preferences.value.set(at.id, { ...(preferences.value.get(at.id) ?? {}), email: true, sms: true, whatsapp: true, print: false, in_app: true });
  });
}

function disableAllInCategory(category: AlertCategory) {
  alertTypes.value.filter((at: AlertType) => at.category === category).forEach((at: AlertType) => {
    preferences.value.set(at.id, { ...(preferences.value.get(at.id) ?? {}), email: false, sms: false, whatsapp: false, print: false, in_app: false });
  });
}

async function savePreferences() {
  saving.value = true;
  try {
    const entityId = entityStore.selectedEntityId;
    const contactId = profileStore.contact?.id;
    if (!entityId || !contactId) throw new Error('Missing entity or contact ID');

    const updates: AlertPreferenceUpdate[] = [];
    preferences.value.forEach((pref, alertTypeId) => {
      updates.push({
        alert_type_id: alertTypeId, preferenceable_type: 'Contact', preferenceable_id: contactId,
        email_enabled: pref.email || false, sms_enabled: pref.sms || false,
        whatsapp_enabled: pref.whatsapp || false, print_enabled: pref.print || false, in_app_enabled: pref.in_app || false,
      });
    });
    await alertPreferenceService.bulkUpdatePreferences(entityId, { preferences: updates });
    notify('positive', 'Preferințele au fost salvate cu succes');
  } catch (error) {
    console.error('Error saving preferences:', error);
    notify('negative', 'Eroare la salvarea preferințelor');
  } finally {
    saving.value = false;
  }
}

function handleBrowserNotificationToggle(value: boolean) {
  if (value) {
    if (browserNotifications.permission.value === 'granted') {
      browserNotifications.enable();
      notify('positive', 'Notificările browser au fost activate');
    } else {
      void handleRequestPermission();
    }
  } else {
    browserNotifications.disable();
    notify('info', 'Notificările browser au fost dezactivate');
  }
}

async function handleRequestPermission() {
  const granted = await browserNotifications.requestPermission();
  if (granted) {
    notify('positive', 'Notificările au fost activate cu succes!');
    browserNotifications.showSimpleNotification('Notificări activate', 'Vei primi notificări pentru alerte importante');
  } else {
    notify('warning', 'Pentru a activa notificările, permite accesul în browser');
  }
}

function getChannelDescription(channel: string): string {
  const descriptions: Record<string, string> = {
    email: 'Notificări prin email', sms: 'Mesaje text SMS',
    whatsapp: 'Mesaje WhatsApp', in_app: 'Notificări în aplicație',
  };
  return descriptions[channel] ?? '';
}

onMounted(() => { void loadData(); });
</script>

<style lang="sass" scoped>
.alert-preferences-page
  min-height: 100vh
  background: var(--color-background)

.loading-container
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  padding: var(--space-2xl)
  min-height: 50vh

.preferences-content
  padding-bottom: 80px

.browser-notifications-card
  margin: var(--space-md)
  background: var(--color-surface)
  border-radius: var(--radius-lg)
  overflow: hidden

.save-button-container
  position: fixed
  bottom: 0
  left: 0
  right: 0
  padding: var(--space-md)
  background: var(--color-surface)
  border-top: 1px solid var(--color-border-light)
  z-index: 100

.save-button
  border-radius: var(--radius-lg)
  min-height: 52px
  font-weight: 600
</style>
