<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 340px; max-width: 480px; width: 100%">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">{{ $t('alertPreferences.addTitle') }}</div>
      </q-card-section>

      <q-card-section>
        <!-- Alert Type -->
        <q-select
          v-model="form.alert_type_id"
          :options="alertTypeOptions"
          option-value="id"
          option-label="name"
          emit-value
          map-options
          :label="$t('alertPreferences.alertType')"
          :rules="[val => !!val || $t('validation.required')]"
          class="q-mb-sm"
        />

        <!-- Channels -->
        <div class="text-caption text-grey-7 q-mb-xs">{{ $t('alertPreferences.channels') }}</div>
        <div class="row q-col-gutter-sm q-mb-sm">
          <div v-for="ch in channels" :key="ch.value" class="col-6">
            <q-toggle
              v-model="form[ch.key]"
              :label="ch.label"
              :color="ch.color"
            />
          </div>
        </div>

        <!-- Quiet hours -->
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input
              v-model="form.quiet_hours_start"
              :label="$t('alertPreferences.quietHoursStart')"
              type="time"
              dense
            />
          </div>
          <div class="col-6">
            <q-input
              v-model="form.quiet_hours_end"
              :label="$t('alertPreferences.quietHoursEnd')"
              type="time"
              dense
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat :label="$t('common.cancel')" @click="handleCancel" />
        <q-btn
          unelevated
          color="primary"
          :label="$t('common.save')"
          :loading="isSaving"
          @click="handleSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { AlertType } from 'src/types/alertPreference.types';

interface FormState {
  alert_type_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  print_enabled: boolean;
  in_app_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  [key: string]: string | boolean;
}

interface Props {
  modelValue: boolean;
  alertTypes: AlertType[];
  contactId: string;
  isSaving?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', data: Omit<FormState, never>): void;
}

const props = withDefaults(defineProps<Props>(), { isSaving: false });
const emit = defineEmits<Emits>();
const { t } = useI18n();

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const defaultForm = (): FormState => ({
  alert_type_id: '',
  email_enabled: true,
  sms_enabled: false,
  whatsapp_enabled: false,
  print_enabled: false,
  in_app_enabled: true,
  quiet_hours_start: '',
  quiet_hours_end: '',
});

const form = ref<FormState>(defaultForm());

const alertTypeOptions = computed(() => props.alertTypes);

const channels = computed(() => [
  { value: 'email', key: 'email_enabled', label: t('alertPreferences.channelEmail'), color: 'blue' },
  { value: 'sms', key: 'sms_enabled', label: t('alertPreferences.channelSms'), color: 'purple' },
  { value: 'whatsapp', key: 'whatsapp_enabled', label: 'WhatsApp', color: 'green' },
  { value: 'in_app', key: 'in_app_enabled', label: t('alertPreferences.channelInApp'), color: 'orange' },
]);

watch(() => props.modelValue, (open) => {
  if (open) form.value = defaultForm();
});

function handleCancel() {
  isOpen.value = false;
}

function handleSave() {
  if (!form.value.alert_type_id) return;
  emit('save', { ...form.value });
}
</script>
