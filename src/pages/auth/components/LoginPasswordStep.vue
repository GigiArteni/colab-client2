<template>
  <div class="step-content">
    <div class="step-header">
      <h2 class="step-title">{{ $t('auth.login') }}</h2>
      <p class="step-description">{{ $t('auth.enterPassword') }}</p>
    </div>

    <div class="identifier-badge" role="button" tabindex="0" :aria-label="$t('common.back')" @click="emit('back')" @keyup.enter="emit('back')" @keyup.space.prevent="emit('back')">
      <q-icon name="las la-user" size="18px" />
      <span class="identifier-badge__text">{{ identifier }}</span>
      <q-icon name="las la-pen" size="14px" class="identifier-badge__edit" />
    </div>

    <q-form class="step-form" @submit.prevent="handleSubmit">
      <q-input
        v-model="password"
        :label="$t('auth.password')"
        :type="showPassword ? 'text' : 'password'"
        outlined
        autofocus
        class="portal-input"
        :error="!!error"
        :error-message="error"
      >
        <template #prepend>
          <q-icon name="las la-lock" color="grey-6" />
        </template>
        <template #append>
          <q-icon
            :name="showPassword ? 'las la-eye-slash' : 'las la-eye'"
            class="cursor-pointer"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>

      <ErrorBanner :error="storeError" class="q-mt-md" />

      <q-btn
        type="submit"
        color="primary"
        class="full-width q-mt-lg portal-btn portal-btn--lg"
        :loading="loading"
        :disable="loading || !password"
        unelevated
      >
        {{ $t('auth.login') }}
      </q-btn>

      <div class="text-center q-mt-md">
        <router-link to="/auth/forgot-password" class="forgot-link">
          {{ $t('auth.forgotPassword') }}
        </router-link>
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ErrorBanner from 'src/components/ui/ErrorBanner.vue';

defineProps<{
  identifier: string;
  loading: boolean;
  storeError: string | null;
}>();

const emit = defineEmits<{
  back: [];
  submit: [password: string];
}>();

const { t } = useI18n();
const password = ref('');
const showPassword = ref(false);
const error = ref('');

function handleSubmit(): void {
  error.value = '';
  if (!password.value) {
    error.value = t('validation.required');
    return;
  }
  emit('submit', password.value);
}

function reset(): void {
  password.value = '';
  error.value = '';
}

defineExpose({ reset, handleSubmit });
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

.identifier-badge
  display: flex
  align-items: center
  gap: var(--space-sm)
  padding: var(--space-sm) var(--space-md)
  background: var(--color-background)
  border-radius: var(--radius-md)
  margin-bottom: var(--space-lg)
  cursor: pointer
  transition: all var(--transition-fast)

  &:hover
    background: var(--color-border-light)

    .identifier-badge__edit
      opacity: 1

.identifier-badge__text
  flex: 1
  font-size: 0.875rem
  color: var(--color-text-primary)
  font-weight: 500

.identifier-badge__edit
  opacity: 0
  color: var(--color-text-muted)
  transition: opacity var(--transition-fast)

.portal-btn
  border-radius: var(--radius-md)
  font-weight: 500
  text-transform: none
  letter-spacing: 0

.portal-btn--lg
  padding: 14px 24px
  font-size: 1rem

.forgot-link
  color: var(--color-text-secondary)
  text-decoration: none
  font-size: 0.875rem
  transition: color var(--transition-fast)

  &:hover
    color: var(--color-primary)
</style>
