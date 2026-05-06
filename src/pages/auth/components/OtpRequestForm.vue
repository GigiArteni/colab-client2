<template>
  <div class="step-content">
    <q-form class="form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label class="form-label">{{ $t('otp.identifier') }}</label>
        <div class="input-wrapper">
          <q-icon name="las la-user" class="input-icon" />
          <q-input
            v-model="identifier"
            :placeholder="$t('otp.identifierHint')"
            outlined
            dense
            class="custom-input"
            :error="!!identifierError"
            :error-message="identifierError"
            @update:model-value="identifierError = ''"
          />
        </div>
      </div>

      <button type="submit" class="primary-btn" :disabled="!identifier.trim() || loading">
        <q-spinner-dots v-if="loading" color="white" size="20px" />
        <template v-else>
          {{ $t('common.continue') }}
          <q-icon name="las la-arrow-right" />
        </template>
      </button>
    </q-form>

    <div class="divider">
      <span class="divider__text">{{ $t('common.or') }}</span>
    </div>

    <router-link to="/auth/login" class="secondary-link">
      <q-icon name="las la-key" />
      {{ $t('otp.usePassword') }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

defineProps<{
  loading: boolean;
}>();

const emit = defineEmits<{
  submit: [identifier: string];
}>();

const { t } = useI18n();
const identifier = ref('');
const identifierError = ref('');

function handleSubmit(): void {
  if (!identifier.value.trim()) {
    identifierError.value = t('validation.required');
    return;
  }
  emit('submit', identifier.value.trim());
}

function setError(msg: string): void {
  identifierError.value = msg;
}

defineExpose({ setError });
</script>

<style lang="sass" scoped>
$primary: #0066FF
$gray-200: #E2E8F0
$gray-400: #94A3B8
$gray-700: #334155
$radius-md: 12px

.step-content
  display: flex
  flex-direction: column
  gap: 16px

.form
  display: flex
  flex-direction: column
  gap: 16px

.form-group
  display: flex
  flex-direction: column
  gap: 6px

.form-label
  font-size: 13px
  font-weight: 500
  color: $gray-700

.input-wrapper
  position: relative

  .input-icon
    position: absolute
    left: 14px
    top: 50%
    transform: translateY(-50%)
    font-size: 18px
    color: $gray-400
    z-index: 1

.custom-input
  :deep(.q-field__control)
    padding-left: 44px

.primary-btn
  display: flex
  align-items: center
  justify-content: center
  gap: 8px
  width: 100%
  padding: 14px 20px
  background: $primary
  color: white
  border: none
  border-radius: $radius-md
  font-size: 15px
  font-weight: 600
  cursor: pointer
  transition: all 0.2s ease

  &:hover:not(:disabled)
    background: #0052CC

  &:disabled
    opacity: 0.6
    cursor: not-allowed

.divider
  display: flex
  align-items: center
  gap: 16px
  margin: 8px 0

  &::before, &::after
    content: ''
    flex: 1
    height: 1px
    background: $gray-200

  &__text
    font-size: 12px
    color: $gray-400
    text-transform: uppercase

.secondary-link
  display: flex
  align-items: center
  justify-content: center
  gap: 8px
  padding: 12px
  color: $primary
  font-size: 14px
  font-weight: 500
  text-decoration: none
  transition: opacity 0.2s ease

  &:hover
    opacity: 0.8
</style>
