<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 300px; max-width: 480px">
      <q-card-section>
        <div class="text-h6">{{ options.title }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none text-body2">
        {{ options.message }}
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          :label="options.cancelLabel ?? t('common.cancel')"
          style="min-height: 40px"
          @click="resolve(false)"
        />
        <q-btn
          color="negative"
          :label="options.okLabel ?? t('common.delete')"
          style="min-height: 40px"
          @click="resolve(true)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

export interface ConfirmOptions {
  title: string;
  message: string;
  okLabel?: string;
  cancelLabel?: string;
}

const { t } = useI18n();

const isOpen = ref(false);
const options = ref<ConfirmOptions>({ title: '', message: '' });
let resolver: ((v: boolean) => void) | null = null;

function confirm(opts: ConfirmOptions): Promise<boolean> {
  options.value = opts;
  isOpen.value = true;
  return new Promise((res) => {
    resolver = res;
  });
}

function resolve(value: boolean): void {
  isOpen.value = false;
  resolver?.(value);
  resolver = null;
}

defineExpose({ confirm });
</script>
