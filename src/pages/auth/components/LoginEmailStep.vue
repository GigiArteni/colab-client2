<template>
  <div class="step-content">
    <div class="step-header">
      <h2 class="step-title">{{ $t('auth.otp.enterIdentifier') }}</h2>
      <p class="step-description">{{ $t('auth.otp.identifierHint') }}</p>
    </div>

    <q-form class="step-form" @submit.prevent="handleSubmit">
      <q-input
        v-model="identifier"
        :label="$t('auth.identifier')"
        outlined
        autofocus
        class="portal-input"
        :error="!!error"
        :error-message="error"
        @keyup.enter="emit('submit', identifier)"
      >
        <template #prepend>
          <q-icon name="las la-user" color="grey-6" />
        </template>
      </q-input>

      <ErrorBanner :error="storeError" class="q-mt-md" />

      <q-btn
        type="submit"
        color="primary"
        class="full-width q-mt-lg portal-btn portal-btn--lg"
        :loading="loading"
        :disable="loading || !identifier.trim()"
        unelevated
      >
        {{ $t('auth.continue') }}
      </q-btn>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ErrorBanner from 'src/components/ui/ErrorBanner.vue';

defineProps<{
  loading: boolean;
  storeError: string | null;
}>();

const emit = defineEmits<{
  submit: [identifier: string];
}>();

const identifier = ref('');
const error = ref('');

function handleSubmit(): void {
  if (!identifier.value.trim()) return;
  emit('submit', identifier.value);
}

defineExpose({ identifier, handleSubmit });
</script>

<style lang="sass" scoped>
.step-content
  width: 100%

.step-header
  text-align: center
  margin-bottom: var(--space-lg)

.step-title
  font-size: 1.25rem
  font-weight: 600
  color: var(--color-text-primary)
  margin: 0 0 var(--space-xs)

.step-description
  font-size: 0.875rem
  color: var(--color-text-secondary)
  margin: 0

.step-form
  width: 100%

.portal-btn
  border-radius: var(--radius-md)
  font-weight: 500
  text-transform: none
  letter-spacing: 0

.portal-btn--lg
  padding: 14px 24px
  font-size: 1rem
</style>
