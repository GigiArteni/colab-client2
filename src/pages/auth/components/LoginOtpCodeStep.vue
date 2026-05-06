<template>
  <div class="step-content">
    <div class="step-header">
      <h2 class="step-title">{{ $t('auth.otp.enterCode') }}</h2>
      <p class="step-description">
        {{ $t('auth.otp.codeSentTo', { destination: maskedDestination }) }}
      </p>
    </div>

    <OtpInput
      ref="otpInputRef"
      v-model="code"
      :has-error="!!otpError"
      :disabled="loading"
      @complete="handleComplete"
    />

    <div v-if="otpError" class="otp-error">{{ otpError }}</div>

    <q-btn
      color="primary"
      class="full-width q-mt-lg portal-btn portal-btn--lg"
      :loading="loading"
      :disable="code.length !== 6 || loading"
      unelevated
      @click="handleVerify"
    >
      {{ $t('auth.otp.verify') }}
    </q-btn>

    <div class="step-actions">
      <q-btn flat dense color="grey-7" class="step-action-btn" @click="emit('back')">
        <q-icon name="las la-arrow-left" size="18px" class="q-mr-xs" />
        {{ $t('common.back') }}
      </q-btn>

      <q-btn
        flat
        dense
        :color="resendCooldown > 0 ? 'grey-5' : 'primary'"
        class="step-action-btn"
        :disable="resendCooldown > 0"
        @click="emit('resend')"
      >
        <template v-if="resendCooldown > 0">
          {{ $t('auth.otp.resendIn', { seconds: resendCooldown }) }}
        </template>
        <template v-else>
          {{ $t('auth.otp.resend') }}
        </template>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import OtpInput from 'src/components/auth/OtpInput.vue';

const props = defineProps<{
  maskedDestination: string | undefined;
  loading: boolean;
  resendCooldown: number;
}>();

const emit = defineEmits<{
  back: [];
  resend: [];
  verify: [code: string];
}>();

const otpInputRef = ref<InstanceType<typeof OtpInput> | null>(null);
const code = ref('');
const otpError = ref('');

function handleComplete(value: string): void {
  if (!props.loading) {
    emit('verify', value);
  }
}

function handleVerify(): void {
  if (code.value.length === 6) {
    emit('verify', code.value);
  }
}

function setError(msg: string): void {
  otpError.value = msg;
  code.value = '';
  // focus() is exposed by OtpInput via defineExpose
  if (otpInputRef.value && typeof (otpInputRef.value as { focus?: () => void }).focus === 'function') {
    (otpInputRef.value as { focus: () => void }).focus();
  }
}

function reset(): void {
  code.value = '';
  otpError.value = '';
}

defineExpose({ setError, reset });
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

.otp-error
  text-align: center
  color: var(--q-negative)
  font-size: 0.875rem
  margin-bottom: var(--space-sm)

.portal-btn
  border-radius: var(--radius-md)
  font-weight: 500
  text-transform: none
  letter-spacing: 0

.portal-btn--lg
  padding: 14px 24px
  font-size: 1rem

.step-actions
  display: flex
  justify-content: space-between
  margin-top: var(--space-lg)

.step-action-btn
  font-size: 0.8125rem
  font-weight: 500
  text-transform: none
</style>
