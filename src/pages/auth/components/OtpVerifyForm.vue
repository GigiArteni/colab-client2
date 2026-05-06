<template>
  <div class="step-content">
    <div class="otp-sent-info">
      <div class="otp-sent-info__icon">
        <q-icon :name="channel === 'sms' ? 'las la-sms' : 'las la-envelope'" />
      </div>
      <span class="otp-sent-info__label">{{ $t('otp.sentTo') }}</span>
      <span class="otp-sent-info__value">{{ maskedDestination }}</span>
    </div>

    <OtpInput
      ref="otpInputRef"
      v-model="otpCode"
      :has-error="!!otpError"
      :disabled="loading"
      class="otp-input-wrapper"
      @complete="emit('verify', otpCode)"
    />

    <div v-if="otpError" class="error-message">
      <q-icon name="las la-exclamation-circle" />
      {{ otpError }}
    </div>

    <div class="resend-section">
      <button
        v-if="resendCountdown > 0"
        class="resend-btn resend-btn--disabled"
        disabled
      >
        {{ $t('otp.resend') }} ({{ resendCountdown }}s)
      </button>
      <button
        v-else
        class="resend-btn"
        :disabled="isResending"
        @click="emit('resend')"
      >
        <q-spinner-dots v-if="isResending" color="primary" size="16px" />
        <template v-else>
          <q-icon name="las la-redo-alt" />
          {{ $t('otp.resend') }}
        </template>
      </button>
    </div>

    <button
      class="primary-btn"
      :disabled="otpCode.length !== 6 || loading"
      @click="emit('verify', otpCode)"
    >
      <q-spinner-dots v-if="loading" color="white" size="20px" />
      <template v-else>
        {{ $t('otp.verify') }}
        <q-icon name="las la-check" />
      </template>
    </button>

    <button class="back-btn" @click="emit('back')">
      <q-icon name="las la-arrow-left" />
      {{ $t('common.back') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import OtpInput from 'src/components/auth/OtpInput.vue';

defineProps<{
  channel: 'sms' | 'email' | null;
  maskedDestination: string;
  loading: boolean;
  resendCountdown: number;
  isResending: boolean;
}>();

const emit = defineEmits<{
  verify: [code: string];
  resend: [];
  back: [];
}>();

const otpInputRef = ref<InstanceType<typeof OtpInput> | null>(null);
const otpCode = ref('');
const otpError = ref('');

function setError(msg: string): void {
  otpError.value = msg;
  otpCode.value = '';
  otpInputRef.value?.focus();
}

function reset(): void {
  otpCode.value = '';
  otpError.value = '';
}

defineExpose({ setError, reset });
</script>

<style lang="sass" scoped>
$primary: #0066FF
$negative: #EF4444
$gray-50: #F8FAFC
$gray-400: #94A3B8
$gray-500: #64748B
$gray-600: #475569
$gray-900: #0F172A
$radius-md: 12px
$radius-sm: 8px

.step-content
  display: flex
  flex-direction: column
  gap: 16px

.otp-sent-info
  display: flex
  flex-direction: column
  align-items: center
  padding: 16px
  background: $gray-50
  border-radius: $radius-md
  text-align: center

  &__icon
    width: 40px
    height: 40px
    background: white
    border-radius: 50%
    display: flex
    align-items: center
    justify-content: center
    font-size: 18px
    color: $primary
    margin-bottom: 8px
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)

  &__label
    font-size: 12px
    color: $gray-500
    margin-bottom: 2px

  &__value
    font-size: 14px
    font-weight: 600
    color: $gray-900

.otp-input-wrapper
  margin: 8px 0

.error-message
  display: flex
  align-items: center
  justify-content: center
  gap: 6px
  padding: 10px 14px
  background: rgba($negative, 0.1)
  color: $negative
  border-radius: $radius-sm
  font-size: 13px

.resend-section
  display: flex
  justify-content: center

.resend-btn
  display: flex
  align-items: center
  gap: 6px
  padding: 8px 16px
  background: transparent
  border: none
  color: $primary
  font-size: 13px
  font-weight: 500
  cursor: pointer
  transition: opacity 0.2s ease

  &:hover:not(:disabled)
    opacity: 0.8

  &--disabled
    color: $gray-400
    cursor: not-allowed

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

.back-btn
  display: flex
  align-items: center
  justify-content: center
  gap: 6px
  width: 100%
  padding: 12px 20px
  background: transparent
  color: $gray-600
  border: none
  font-size: 14px
  font-weight: 500
  cursor: pointer
  transition: color 0.2s ease

  &:hover
    color: $gray-900
</style>
