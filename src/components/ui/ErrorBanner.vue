<template>
  <q-banner
    v-if="message"
    class="error-banner q-mb-md"
    rounded
    inline-actions
    role="alert"
    :class="dense ? 'q-pa-sm' : ''"
  >
    <template #avatar>
      <q-icon name="las la-exclamation-circle" color="negative" />
    </template>

    <span class="text-negative">{{ message }}</span>

    <template #action>
      <slot name="retry">
        <q-btn
          v-if="showRetry"
          flat
          color="negative"
          :label="t('common.tryAgain')"
          size="sm"
          style="min-height: 40px; min-width: 40px"
          @click="emit('retry')"
        />
      </slot>
    </template>
  </q-banner>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  error?: string | Error | null;
  showRetry?: boolean;
  dense?: boolean;
}>();

const emit = defineEmits<{
  retry: [];
}>();

const { t } = useI18n();

const message = computed(() => {
  if (!props.error) return null;
  if (typeof props.error === 'string') return props.error;
  return props.error.message || t('common.error');
});
</script>
