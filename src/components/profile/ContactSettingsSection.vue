<template>
  <q-card class="q-mb-md">
    <q-card-section>
      <div class="text-subtitle1 q-mb-sm">{{ t('contactSettings.title') }}</div>
      <div class="text-caption text-grey q-mb-md">{{ t('contactSettings.hint') }}</div>

      <div v-if="loading" class="flex flex-center q-pa-md">
        <q-spinner-dots size="30px" color="primary" />
      </div>

      <ErrorBanner v-else-if="loadError" :message="loadError" class="q-mb-md" />

      <template v-else>
        <q-input
          v-model="form.billing_email_override"
          :label="t('contactSettings.billingEmail')"
          :hint="t('contactSettings.billingEmailHint')"
          outlined
          dense
          type="email"
          clearable
          class="q-mb-md"
          @update:model-value="scheduleAutosave"
        />

        <q-select
          v-model="form.preferred_notification_channel"
          :label="t('contactSettings.preferredChannel')"
          :options="channelOptions"
          emit-value
          map-options
          outlined
          dense
          class="q-mb-md"
          @update:model-value="scheduleAutosave"
        />

        <div class="text-caption text-grey q-mb-sm">{{ t('contactSettings.receiveLabel') }}</div>

        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-4">
            <q-toggle
              v-model="form.receive_invoices"
              :label="t('contactSettings.receiveInvoices')"
              color="primary"
              @update:model-value="scheduleAutosave"
            />
          </div>
          <div class="col-12 col-sm-4">
            <q-toggle
              v-model="form.receive_alerts"
              :label="t('contactSettings.receiveAlerts')"
              color="primary"
              @update:model-value="scheduleAutosave"
            />
          </div>
          <div class="col-12 col-sm-4">
            <q-toggle
              v-model="form.receive_readings_reminders"
              :label="t('contactSettings.receiveReadings')"
              color="primary"
              @update:model-value="scheduleAutosave"
            />
          </div>
        </div>

        <div class="row justify-end items-center q-gutter-sm q-mt-md">
          <q-spinner v-if="saving" size="sm" color="primary" />
          <span v-if="saving" class="text-caption text-grey">{{ t('profileSettings.saving') }}</span>
          <span v-if="saved && !saving" class="text-caption text-positive">
            <q-icon name="las la-check" size="sm" /> {{ t('profileSettings.saved') }}
          </span>
          <span v-if="saveError && !saving" class="text-caption text-negative">{{ saveError }}</span>
        </div>
      </template>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { contactSettingsService } from 'src/services/contactSettings.service';
import { useProfileStore } from 'src/stores/profile';
import ErrorBanner from 'src/components/ui/ErrorBanner.vue';

const { t } = useI18n();
const profileStore = useProfileStore();

const loading = ref(false);
const loadError = ref<string | null>(null);
const saving = ref(false);
const saved = ref(false);
const saveError = ref<string | null>(null);
let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
let currentSettingId = '';

const form = reactive({
  billing_email_override: '',
  preferred_notification_channel: 'email' as 'email' | 'sms' | 'any',
  receive_invoices: true,
  receive_alerts: true,
  receive_readings_reminders: true,
});

const channelOptions = [
  { label: t('profileSettings.channels.options.email'), value: 'email' },
  { label: t('profileSettings.channels.options.sms'), value: 'sms' },
  { label: t('profileSettings.channels.options.any'), value: 'any' },
];

async function loadSettings(): Promise<void> {
  const contactId = profileStore.contact?.id;
  if (!contactId) return;

  loading.value = true;
  loadError.value = null;
  try {
    const settings = await contactSettingsService.getSettings(contactId);
    currentSettingId = settings.contact_id ?? '';
    form.billing_email_override = settings.billing_email_override ?? '';
    form.preferred_notification_channel = settings.preferred_notification_channel ?? 'email';
    form.receive_invoices = settings.receive_invoices ?? true;
    form.receive_alerts = settings.receive_alerts ?? true;
    form.receive_readings_reminders = settings.receive_readings_reminders ?? true;
  } catch {
    loadError.value = t('contactSettings.loadError');
  } finally {
    loading.value = false;
  }
}

function scheduleAutosave(): void {
  saved.value = false;
  saveError.value = null;
  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => void autosave(), 800);
}

async function autosave(): Promise<void> {
  const contactId = profileStore.contact?.id;
  if (!contactId || !currentSettingId) return;

  saving.value = true;
  saveError.value = null;
  try {
    const settingsPayload: Parameters<typeof contactSettingsService.updateSettings>[2] = {
      preferred_notification_channel: form.preferred_notification_channel,
      receive_invoices: form.receive_invoices,
      receive_alerts: form.receive_alerts,
      receive_readings_reminders: form.receive_readings_reminders,
    };
    if (form.billing_email_override) settingsPayload.billing_email_override = form.billing_email_override;
    await contactSettingsService.updateSettings(contactId, currentSettingId, settingsPayload);
    saved.value = true;
    setTimeout(() => { saved.value = false; }, 3000);
  } catch {
    saveError.value = t('contactSettings.saveError');
  } finally {
    saving.value = false;
  }
}

onMounted(() => { void loadSettings(); });
</script>
