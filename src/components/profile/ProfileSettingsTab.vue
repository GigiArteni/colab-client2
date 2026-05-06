<template>
  <div>
    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner-dots size="40px" color="primary" />
    </div>

    <div v-else-if="loadError" class="q-pa-md">
      <ErrorBanner :message="loadError" />
    </div>

    <template v-else>
      <!-- Notification preferences -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">{{ t('profileSettings.notifications.title') }}</div>
          <div class="text-caption text-grey q-mb-md">{{ t('profileSettings.notifications.hint') }}</div>

          <q-markup-table flat separator="horizontal">
            <thead>
              <tr>
                <th class="text-left">{{ t('profileSettings.notifications.category') }}</th>
                <th class="text-center">{{ t('profileSettings.notifications.email') }}</th>
                <th class="text-center">{{ t('profileSettings.notifications.sms') }}</th>
                <th class="text-center">{{ t('profileSettings.notifications.push') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cat in notificationCategories" :key="cat.key">
                <td>{{ t(`profileSettings.notifications.categories.${cat.key}`) }}</td>
                <td class="text-center">
                  <q-toggle
                    v-model="notifPrefs[cat.key].email"
                    color="primary"
                    @update:model-value="scheduleAutosave"
                  />
                </td>
                <td class="text-center">
                  <q-toggle
                    v-model="notifPrefs[cat.key].sms"
                    color="primary"
                    @update:model-value="scheduleAutosave"
                  />
                </td>
                <td class="text-center">
                  <q-toggle
                    v-model="notifPrefs[cat.key].push"
                    color="primary"
                    @update:model-value="scheduleAutosave"
                  />
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
      </q-card>

      <!-- Language + Timezone -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 q-mb-md">{{ t('profileSettings.localization.title') }}</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-select
                v-model="form.language"
                :label="t('profileSettings.localization.language')"
                :options="languageOptions"
                emit-value
                map-options
                outlined
                dense
                @update:model-value="scheduleAutosave"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-select
                v-model="form.timezone"
                :label="t('profileSettings.localization.timezone')"
                :options="timezoneOptions"
                emit-value
                map-options
                outlined
                dense
                use-input
                input-debounce="300"
                @filter="filterTimezones"
                @update:model-value="scheduleAutosave"
              >
                <template #no-option>
                  <q-item>
                    <q-item-section class="text-grey">{{ t('common.loading') }}</q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Communication channels -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 q-mb-md">{{ t('profileSettings.channels.title') }}</div>

          <q-select
            v-model="form.preferred_channel"
            :label="t('profileSettings.channels.preferredChannel')"
            :options="channelOptions"
            emit-value
            map-options
            outlined
            dense
            class="q-mb-md"
            @update:model-value="scheduleAutosave"
          />

          <q-input
            v-model="form.email_override"
            :label="t('profileSettings.channels.emailOverride')"
            :hint="t('profileSettings.channels.emailOverrideHint')"
            outlined
            dense
            type="email"
            clearable
            class="q-mb-md"
            @update:model-value="scheduleAutosave"
          />

          <q-input
            v-model="form.phone_override"
            :label="t('profileSettings.channels.phoneOverride')"
            :hint="t('profileSettings.channels.phoneOverrideHint')"
            outlined
            dense
            clearable
            @update:model-value="scheduleAutosave"
          />
        </q-card-section>
      </q-card>

      <!-- Autosave indicator -->
      <div class="row justify-end items-center q-gutter-sm q-mb-md">
        <q-spinner v-if="saving" size="sm" color="primary" />
        <span v-if="saving" class="text-caption text-grey">{{ t('profileSettings.saving') }}</span>
        <span v-if="saved && !saving" class="text-caption text-positive">
          <q-icon name="las la-check" size="sm" /> {{ t('profileSettings.saved') }}
        </span>
        <span v-if="saveError && !saving" class="text-caption text-negative">{{ saveError }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { profileService } from 'src/services/profile.service';
import ErrorBanner from 'src/components/ui/ErrorBanner.vue';
import type { NotificationCategory, NotificationChannelPrefs } from 'src/types';

const { t } = useI18n();

const loading = ref(false);
const loadError = ref<string | null>(null);
const saving = ref(false);
const saved = ref(false);
const saveError = ref<string | null>(null);
let autosaveTimer: ReturnType<typeof setTimeout> | null = null;

const notificationCategories: { key: NotificationCategory }[] = [
  { key: 'invoice' },
  { key: 'payment' },
  { key: 'reading' },
  { key: 'subscription' },
  { key: 'maintenance' },
  { key: 'alert' },
  { key: 'general' },
];

const defaultChannelPrefs = (): NotificationChannelPrefs => ({ email: true, sms: false, push: false });

const notifPrefs = reactive<Record<NotificationCategory, NotificationChannelPrefs>>({
  invoice: defaultChannelPrefs(),
  payment: defaultChannelPrefs(),
  reading: defaultChannelPrefs(),
  subscription: defaultChannelPrefs(),
  maintenance: defaultChannelPrefs(),
  alert: defaultChannelPrefs(),
  general: defaultChannelPrefs(),
});

const form = reactive({
  language: 'en',
  timezone: 'UTC',
  preferred_channel: 'email' as 'email' | 'sms' | 'any',
  email_override: '',
  phone_override: '',
});

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Română', value: 'ro' },
];

const ALL_TIMEZONES = Intl.supportedValuesOf
  ? Intl.supportedValuesOf('timeZone').map((tz) => ({ label: tz, value: tz }))
  : [
      { label: 'UTC', value: 'UTC' },
      { label: 'Europe/Bucharest', value: 'Europe/Bucharest' },
      { label: 'Europe/London', value: 'Europe/London' },
      { label: 'America/New_York', value: 'America/New_York' },
    ];

const timezoneOptions = ref(ALL_TIMEZONES.slice(0, 50));

function filterTimezones(val: string, update: (fn: () => void) => void): void {
  update(() => {
    const needle = val.toLowerCase();
    timezoneOptions.value = needle
      ? ALL_TIMEZONES.filter((tz) => tz.label.toLowerCase().includes(needle)).slice(0, 50)
      : ALL_TIMEZONES.slice(0, 50);
  });
}

const channelOptions = [
  { label: t('profileSettings.channels.options.email'), value: 'email' },
  { label: t('profileSettings.channels.options.sms'), value: 'sms' },
  { label: t('profileSettings.channels.options.any'), value: 'any' },
];

async function loadSettings(): Promise<void> {
  loading.value = true;
  loadError.value = null;
  try {
    const settings = await profileService.getSettings();
    if (settings.notification_preferences) {
      for (const cat of notificationCategories) {
        const prefs = settings.notification_preferences[cat.key];
        if (prefs) Object.assign(notifPrefs[cat.key], prefs);
      }
    }
    if (settings.language) form.language = settings.language;
    if (settings.timezone) form.timezone = settings.timezone;
    if (settings.communication_channels) {
      form.preferred_channel = settings.communication_channels.preferred_channel;
      form.email_override = settings.communication_channels.email_override ?? '';
      form.phone_override = settings.communication_channels.phone_override ?? '';
    }
  } catch {
    loadError.value = t('profileSettings.loadError');
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
  saving.value = true;
  saveError.value = null;
  try {
    await profileService.updateSettings({
      notification_preferences: { ...notifPrefs },
      language: form.language,
      timezone: form.timezone,
      communication_channels: (() => {
        const ch: { preferred_channel: 'any' | 'sms' | 'email'; email_override?: string; phone_override?: string } = {
          preferred_channel: form.preferred_channel,
        };
        if (form.email_override) ch.email_override = form.email_override;
        if (form.phone_override) ch.phone_override = form.phone_override;
        return ch;
      })(),
    });
    saved.value = true;
    setTimeout(() => { saved.value = false; }, 3000);
  } catch {
    saveError.value = t('profileSettings.saveError');
  } finally {
    saving.value = false;
  }
}

onMounted(() => { void loadSettings(); });
</script>
