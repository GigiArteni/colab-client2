<template>
  <div class="step-content">
    <div class="step-header">
      <h2 class="step-title">{{ $t('auth.mfa.title') }}</h2>
      <p class="step-description">
        <template v-if="challenge?.masked_destination">
          {{ $t('auth.mfa.codeSentTo', { destination: challenge.masked_destination }) }}
        </template>
        <template v-else>
          {{ $t('auth.mfa.enterTotpCode') }}
        </template>
      </p>
    </div>

    <!-- Method selection (when no challenge yet) -->
    <div v-if="!challenge && methods.length > 1" class="channel-list">
      <div
        v-for="method in methods"
        :key="method.method"
        class="channel-option"
        @click="emit('request-challenge', method.method)"
      >
        <div class="channel-option__icon">
          <q-icon :name="methodIcon(method.method)" size="24px" />
        </div>
        <div class="channel-option__content">
          <div class="channel-option__label">{{ methodLabel(method.method) }}</div>
        </div>
        <div class="channel-option__action">
          <q-icon name="las la-chevron-right" size="20px" />
        </div>
      </div>
    </div>

    <!-- Code input -->
    <template v-else>
      <OtpInput
        ref="otpInputRef"
        v-model="code"
        :has-error="!!mfaError"
        :disabled="loading"
        @complete="handleComplete"
      />

      <div v-if="mfaError" class="otp-error">{{ mfaError }}</div>

      <q-checkbox
        v-model="trustDevice"
        :label="$t('auth.mfa.trustDevice')"
        class="q-mt-sm"
      />

      <q-btn
        color="primary"
        class="full-width q-mt-lg portal-btn portal-btn--lg"
        :loading="loading"
        :disable="code.length !== 6 || loading"
        unelevated
        @click="handleVerify"
      >
        {{ $t('auth.mfa.verify') }}
      </q-btn>

      <ErrorBanner :error="storeError" class="q-mt-md" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import OtpInput from 'src/components/auth/OtpInput.vue';
import ErrorBanner from 'src/components/ui/ErrorBanner.vue';
import type { MfaMethod, MfaChallengeResponse } from 'src/types';

const props = defineProps<{
  methods: MfaMethod[];
  challenge: MfaChallengeResponse | null;
  loading: boolean;
  storeError: string | null;
}>();

const emit = defineEmits<{
  'request-challenge': [method: string];
  verify: [code: string, trustDevice: boolean];
}>();

const { t } = useI18n();
const otpInputRef = ref<InstanceType<typeof OtpInput> | null>(null);
const code = ref('');
const mfaError = ref('');
const trustDevice = ref(false);

function methodIcon(method: string): string {
  if (method === 'totp') return 'las la-shield-alt';
  if (method === 'sms') return 'las la-mobile';
  return 'las la-envelope';
}

function methodLabel(method: string): string {
  if (method === 'totp') return t('auth.mfa.enterTotpCode');
  if (method === 'sms') return t('auth.otp.channel.sms');
  return t('auth.otp.channel.email');
}

function handleComplete(value: string): void {
  if (!props.loading) {
    emit('verify', value, trustDevice.value);
  }
}

function handleVerify(): void {
  if (code.value.length === 6) {
    emit('verify', code.value, trustDevice.value);
  }
}

function setError(msg: string): void {
  mfaError.value = msg;
  code.value = '';
  otpInputRef.value?.focus();
}

function reset(): void {
  code.value = '';
  mfaError.value = '';
  trustDevice.value = false;
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

.channel-list
  display: flex
  flex-direction: column
  gap: var(--space-sm)

.channel-option
  display: flex
  align-items: center
  gap: var(--space-md)
  padding: var(--space-md)
  border: 2px solid var(--color-border)
  border-radius: var(--radius-lg)
  cursor: pointer
  transition: all var(--transition-fast)

  &:hover
    border-color: var(--color-primary-light)
    background-color: rgba(37, 99, 235, 0.02)

.channel-option__icon
  width: 44px
  height: 44px
  border-radius: var(--radius-md)
  background: var(--color-background)
  display: flex
  align-items: center
  justify-content: center
  color: var(--color-primary)

.channel-option__content
  flex: 1

.channel-option__label
  font-size: 0.9375rem
  font-weight: 500
  color: var(--color-text-primary)

.channel-option__action
  color: var(--color-text-muted)

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
</style>
