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
        <q-toolbar-title>Preferințe Notificări</q-toolbar-title>
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
            label="Activează Notificările"
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

      <!-- Category Tabs -->
      <q-tabs
        v-model="selectedCategory"
        align="left"
        dense
        no-caps
        active-color="primary"
        indicator-color="primary"
        class="category-tabs"
        mobile-arrows
      >
        <q-tab
          v-for="category in categories"
          :key="category.value"
          :name="category.value"
          :icon="category.icon"
          :label="category.label"
        >
          <q-badge
            v-if="getAlertTypeCountByCategory(category.value) > 0"
            color="grey-5"
            floating
            :label="getAlertTypeCountByCategory(category.value)"
            class="category-badge"
          />
        </q-tab>
      </q-tabs>

      <!-- Category Content -->
      <q-tab-panels
        v-model="selectedCategory"
        animated
        class="category-panels bg-transparent"
      >
        <q-tab-panel
          v-for="category in categories"
          :key="category.value"
          :name="category.value"
          class="q-pa-none"
        >
          <!-- Category Actions -->
          <div class="category-actions">
            <q-btn
              flat
              dense
              size="sm"
              color="positive"
              icon="las la-check-circle"
              label="Activează Tot"
              @click="enableAllInCategory(category.value)"
              class="q-mr-sm"
            />
            <q-btn
              flat
              dense
              size="sm"
              color="negative"
              icon="las la-ban"
              label="Dezactivează Tot"
              @click="disableAllInCategory(category.value)"
            />
          </div>

          <!-- Alert Types List -->
          <div class="alert-types-list">
            <q-card
              v-for="alertType in getAlertTypesByCategory(category.value)"
              :key="alertType.id"
              flat
              bordered
              class="alert-type-card q-mb-md"
            >
              <!-- Card Header -->
              <q-card-section class="alert-type-header">
                <div class="row items-center">
                  <div class="col">
                    <div class="alert-type-name">{{ alertType.name }}</div>
                    <div class="alert-type-description">
                      {{ alertType.description || 'Fără descriere' }}
                    </div>
                    <div class="alert-type-meta q-mt-xs">
                      <q-badge
                        :color="getPriorityColor(alertType.priority)"
                        :label="getPriorityLabel(alertType.priority)"
                        size="sm"
                      />
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-chip
                      v-if="hasAnyChannelEnabled(alertType.id)"
                      color="positive"
                      text-color="white"
                      icon="las la-check"
                      size="sm"
                    >
                      Activ
                    </q-chip>
                    <q-chip
                      v-else
                      color="grey-5"
                      text-color="white"
                      icon="las la-ban"
                      size="sm"
                    >
                      Inactiv
                    </q-chip>
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <!-- Channel Toggles -->
              <q-card-section class="channel-toggles">
                <div class="text-caption text-grey-7 q-mb-sm">Canale de notificare:</div>
                <div class="row q-col-gutter-md">
                  <div
                    v-for="channel in channels"
                    :key="channel.value"
                    class="col-6"
                  >
                    <q-item
                      clickable
                      @click="toggleChannel(alertType.id, channel.value)"
                      class="channel-item"
                      :class="{ 'channel-item--active': isChannelEnabled(alertType.id, channel.value) }"
                    >
                      <q-item-section avatar>
                        <q-icon :name="channel.icon" :color="channel.color" size="24px" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="channel-label">{{ channel.label }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-toggle
                          :model-value="isChannelEnabled(alertType.id, channel.value)"
                          :color="channel.color"
                          @click.stop
                          @update:model-value="toggleChannel(alertType.id, channel.value)"
                        />
                      </q-item-section>
                    </q-item>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Empty State -->
            <div v-if="getAlertTypesByCategory(category.value).length === 0" class="empty-state">
              <q-icon name="las la-inbox" size="64px" color="grey-5" />
              <div class="text-h6 q-mt-md text-grey-7">Nu există tipuri de alerte</div>
              <div class="text-caption text-grey-6">Pentru această categorie</div>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- Fixed Save Button -->
    <div v-if="!loading" class="save-button-container">
      <q-btn
        unelevated
        color="primary"
        icon="las la-save"
        label="Salvează Preferințele"
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useEntityStore } from 'src/stores/entity';
import { useProfileStore } from 'src/stores/profile';
import { useBrowserNotifications } from 'src/composables/useBrowserNotifications';
import * as alertPreferenceService from 'src/services/alertPreference.service';
import type {
  AlertType,
  AlertPreference,
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

// Computed
const getAlertTypesByCategory = (category: AlertCategory) => {
  return alertTypes.value.filter((at) => at.category === category);
};

const getAlertTypeCountByCategory = (category: AlertCategory) => {
  return alertTypes.value.filter((at) => at.category === category).length;
};

// Methods
const loadData = async () => {
  loading.value = true;
  try {
    const entityId = entityStore.selectedEntityId;
    const contactId = profileStore.contact?.id;

    if (!entityId || !contactId) {
      throw new Error('Missing entity or contact ID');
    }

    // Load alert types
    const types = await alertPreferenceService.getAlertTypes(entityId);
    alertTypes.value = types;

    // Load existing preferences
    const prefs = await alertPreferenceService.getContactPreferences(entityId, contactId);

    // Convert preferences array to Map for easy lookup
    preferences.value = new Map();

    prefs.forEach((pref: AlertPreference) => {
      preferences.value.set(pref.alert_type_id, {
        id: pref.id,
        email: pref.email_enabled,
        sms: pref.sms_enabled,
        whatsapp: pref.whatsapp_enabled,
        print: pref.print_enabled,
        in_app: pref.in_app_enabled,
      });
    });

    // Initialize preferences for alert types that don't have any yet
    alertTypes.value.forEach((alertType) => {
      if (!preferences.value.has(alertType.id)) {
        preferences.value.set(alertType.id, {
          email: true,
          sms: false,
          whatsapp: false,
          print: false,
          in_app: true,
        });
      }
    });
  } catch (error) {
    console.error('Error loading alert preferences:', error);
    $q.notify({
      type: 'negative',
      message: 'Eroare la încărcarea preferințelor',
      icon: 'las la-exclamation-triangle',
    });
  } finally {
    loading.value = false;
  }
};

const isChannelEnabled = (alertTypeId: string, channel: string) => {
  const pref = preferences.value.get(alertTypeId);
  return pref ? pref[channel as keyof typeof pref] : false;
};

const toggleChannel = (alertTypeId: string, channel: string) => {
  const pref = preferences.value.get(alertTypeId) || {
    email: false,
    sms: false,
    whatsapp: false,
    print: false,
    in_app: false,
  };

  pref[channel as keyof typeof pref] = !pref[channel as keyof typeof pref];
  preferences.value.set(alertTypeId, pref);
};

const hasAnyChannelEnabled = (alertTypeId: string) => {
  const pref = preferences.value.get(alertTypeId);
  if (!pref) return false;
  return pref.email || pref.sms || pref.whatsapp || pref.print || pref.in_app;
};

const enableAllInCategory = (category: AlertCategory) => {
  const typesInCategory = alertTypes.value.filter((at) => at.category === category);
  typesInCategory.forEach((alertType) => {
    preferences.value.set(alertType.id, {
      ...(preferences.value.get(alertType.id) || {}),
      email: true,
      sms: true,
      whatsapp: true,
      print: false, // Print usually stays false
      in_app: true,
    });
  });
};

const disableAllInCategory = (category: AlertCategory) => {
  const typesInCategory = alertTypes.value.filter((at) => at.category === category);
  typesInCategory.forEach((alertType) => {
    preferences.value.set(alertType.id, {
      ...(preferences.value.get(alertType.id) || {}),
      email: false,
      sms: false,
      whatsapp: false,
      print: false,
      in_app: false,
    });
  });
};

const savePreferences = async () => {
  saving.value = true;
  try {
    const entityId = entityStore.selectedEntityId;
    const contactId = profileStore.contact?.id;

    if (!entityId || !contactId) {
      throw new Error('Missing entity or contact ID');
    }

    // Build bulk update payload
    const updates: any[] = [];
    preferences.value.forEach((pref, alertTypeId) => {
      updates.push({
        alert_type_id: alertTypeId,
        preferenceable_type: 'Contact',
        preferenceable_id: contactId,
        email_enabled: pref.email || false,
        sms_enabled: pref.sms || false,
        whatsapp_enabled: pref.whatsapp || false,
        print_enabled: pref.print || false,
        in_app_enabled: pref.in_app || false,
      });
    });

    // Bulk update
    await alertPreferenceService.bulkUpdatePreferences(entityId, {
      preferences: updates,
    });

    $q.notify({
      type: 'positive',
      message: 'Preferințele au fost salvate cu succes',
      icon: 'las la-check',
      position: 'top',
    });
  } catch (error) {
    console.error('Error saving preferences:', error);
    $q.notify({
      type: 'negative',
      message: 'Eroare la salvarea preferințelor',
      icon: 'las la-exclamation-triangle',
      position: 'top',
    });
  } finally {
    saving.value = false;
  }
};

/**
 * Handle browser notification toggle
 */
function handleBrowserNotificationToggle(value: boolean) {
  if (value) {
    // If trying to enable, ensure permission is granted
    if (browserNotifications.permission.value === 'granted') {
      browserNotifications.enable();
      $q.notify({
        type: 'positive',
        message: 'Notificările browser au fost activate',
        icon: 'las la-check',
        position: 'top',
      });
    } else {
      // Need to request permission first
      void handleRequestPermission();
    }
  } else {
    // Disable notifications
    browserNotifications.disable();
    $q.notify({
      type: 'info',
      message: 'Notificările browser au fost dezactivate',
      icon: 'las la-info-circle',
      position: 'top',
    });
  }
}

/**
 * Request browser notification permission
 */
async function handleRequestPermission() {
  const granted = await browserNotifications.requestPermission();

  if (granted) {
    $q.notify({
      type: 'positive',
      message: 'Notificările au fost activate cu succes!',
      icon: 'las la-check',
      position: 'top',
    });

    // Show a test notification
    browserNotifications.showSimpleNotification(
      'Notificări activate',
      'Vei primi notificări pentru alerte importante'
    );
  } else {
    $q.notify({
      type: 'warning',
      message: 'Pentru a activa notificările, permite accesul în browser',
      icon: 'las la-exclamation-triangle',
      position: 'top',
    });
  }
}

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    urgent: 'negative',
    high: 'orange',
    normal: 'primary',
    low: 'grey-6',
  };
  return colors[priority.toLowerCase()] || 'grey-6';
};

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    urgent: 'Urgent',
    high: 'Mare',
    normal: 'Normal',
    low: 'Scăzută',
  };
  return labels[priority.toLowerCase()] || priority;
};

const getChannelDescription = (channel: string) => {
  const descriptions: Record<string, string> = {
    email: 'Notificări prin email',
    sms: 'Mesaje text SMS',
    whatsapp: 'Mesaje WhatsApp',
    in_app: 'Notificări în aplicație',
  };
  return descriptions[channel] || '';
};

// Lifecycle
onMounted(() => {
  void loadData();
});
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

.category-tabs
  background: var(--color-surface)
  border-bottom: 1px solid var(--color-border-light)
  position: sticky
  top: 0
  z-index: 10

  :deep(.q-tab)
    min-height: 56px

.category-badge
  font-size: 0.625rem

.category-panels
  padding: var(--space-md)

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

.channel-item
  border: 1px solid var(--color-border-light)
  border-radius: var(--radius-md)
  background: var(--color-surface)
  min-height: 60px
  transition: all 0.2s ease

  &:active
    background: rgba(0, 0, 0, 0.05)

  &--active
    border-color: var(--q-primary)
    background: rgba(37, 99, 235, 0.04)

.channel-label
  font-size: 0.9375rem
  font-weight: 500

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

.empty-state
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  padding: var(--space-2xl) var(--space-md)
  text-align: center
</style>
