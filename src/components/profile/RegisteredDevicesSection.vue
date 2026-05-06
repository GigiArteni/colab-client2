<template>
  <q-card class="q-mb-md">
    <q-card-section>
      <div class="text-subtitle1 q-mb-sm">{{ t('registeredDevices.title') }}</div>
      <div class="text-caption text-grey q-mb-md">{{ t('registeredDevices.hint') }}</div>

      <div v-if="loading" class="flex flex-center q-pa-md">
        <q-spinner-dots size="30px" color="primary" />
      </div>

      <ErrorBanner v-else-if="loadError" :message="loadError" class="q-mb-md" />

      <template v-else>
        <div v-if="devices.length === 0" class="text-caption text-grey text-center q-pa-md">
          {{ t('registeredDevices.noDevices') }}
        </div>

        <q-list separator v-else>
          <q-item v-for="device in devices" :key="device.id">
            <q-item-section avatar>
              <q-icon :name="platformIcon(device.platform)" size="28px" color="grey-7" />
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ device.device_name }}</q-item-label>
              <q-item-label caption>
                {{ t('registeredDevices.platform') }}: {{ device.platform }}
              </q-item-label>
              <q-item-label caption v-if="device.last_used">
                {{ t('registeredDevices.lastUsed') }}: {{ formatDate(device.last_used) }}
              </q-item-label>
              <q-item-label caption>
                {{ t('registeredDevices.registered') }}: {{ formatDate(device.created_at) }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-btn
                flat
                round
                icon="las la-trash-alt"
                color="negative"
                size="sm"
                :loading="revokingId === device.id"
                @click="confirmRevoke(device)"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <div class="row justify-end q-mt-sm">
          <q-btn
            flat
            icon="las la-sync"
            :label="t('common.tryAgain')"
            size="sm"
            color="primary"
            @click="loadDevices"
          />
        </div>
      </template>
    </q-card-section>

    <ConfirmDialog ref="confirmDialogRef" />
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { profileService } from 'src/services/profile.service';
import ErrorBanner from 'src/components/ui/ErrorBanner.vue';
import ConfirmDialog from 'src/components/ui/ConfirmDialog.vue';
import type { DeviceToken } from 'src/types';

const { t } = useI18n();

const loading = ref(false);
const loadError = ref<string | null>(null);
const devices = ref<DeviceToken[]>([]);
const revokingId = ref<string | null>(null);
const confirmDialogRef = ref<InstanceType<typeof ConfirmDialog> | null>(null);

function platformIcon(platform: string): string {
  if (platform === 'ios') return 'las la-apple';
  if (platform === 'android') return 'lab la-android';
  return 'las la-globe';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

async function loadDevices(): Promise<void> {
  loading.value = true;
  loadError.value = null;
  try {
    devices.value = await profileService.listDevices();
  } catch {
    loadError.value = t('registeredDevices.loadError');
  } finally {
    loading.value = false;
  }
}

async function confirmRevoke(device: DeviceToken): Promise<void> {
  const confirmed = await confirmDialogRef.value?.confirm({
    title: t('registeredDevices.revokeTitle'),
    message: t('registeredDevices.revokeMessage', { name: device.device_name }),
    okLabel: t('registeredDevices.revokeConfirm'),
    cancelLabel: t('common.cancel'),
  });

  if (!confirmed) return;

  revokingId.value = device.id;
  try {
    await profileService.revokeDevice(device.id);
    devices.value = devices.value.filter((d) => d.id !== device.id);
  } catch {
    // silently — device stays in list
  } finally {
    revokingId.value = null;
  }
}

onMounted(() => { void loadDevices(); });
</script>
