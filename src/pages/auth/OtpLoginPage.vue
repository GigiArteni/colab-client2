<template>
  <div class="otp-login">
    <!-- Step Indicator -->
    <div class="step-indicator">
      <div
        class="step-indicator__item"
        :class="{
          'step-indicator__item--active': step === 'identifier',
          'step-indicator__item--completed': step !== 'identifier',
        }"
      >
        <span class="step-indicator__number">1</span>
      </div>
      <div
        class="step-indicator__line"
        :class="{ 'step-indicator__line--active': step !== 'identifier' }"
      ></div>
      <div
        class="step-indicator__item"
        :class="{ 'step-indicator__item--active': step === 'otp' }"
      >
        <span class="step-indicator__number">2</span>
      </div>
    </div>

    <!-- Step Header -->
    <header class="step-header">
      <div class="step-header__icon" :class="`step-header__icon--${step}`">
        <q-icon :name="stepIcon" />
      </div>
      <h2 class="step-header__title">{{ stepTitle }}</h2>
      <p class="step-header__subtitle">{{ stepSubtitle }}</p>
    </header>

    <OtpRequestForm
      v-if="step === 'identifier'"
      ref="requestFormRef"
      :loading="authStore.isLoading"
      @submit="handleRequestOtp"
    />

    <OtpVerifyForm
      v-else-if="step === 'otp'"
      ref="verifyFormRef"
      :channel="otpChannel"
      :masked-destination="maskedDestination"
      :loading="authStore.isLoading"
      :resend-countdown="resendCountdown"
      :is-resending="isResending"
      @verify="handleVerifyOtp"
      @resend="handleResendOtp"
      @back="goBackToIdentifier"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/auth';
import OtpRequestForm from './components/OtpRequestForm.vue';
import OtpVerifyForm from './components/OtpVerifyForm.vue';

type OtpStep = 'identifier' | 'otp';

const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();
const authStore = useAuthStore();

const step = ref<OtpStep>('identifier');
const identifier = ref('');
const otpChannel = ref<'sms' | 'email' | null>(null);
const maskedDestination = ref('');
const resendCountdown = ref(0);
const isResending = ref(false);

const requestFormRef = ref<InstanceType<typeof OtpRequestForm> | null>(null);
const verifyFormRef = ref<InstanceType<typeof OtpVerifyForm> | null>(null);

let countdownInterval: ReturnType<typeof setInterval> | null = null;

const stepIcon = computed(() => {
  return step.value === 'identifier' ? 'las la-mobile-alt' : 'las la-shield-alt';
});

const stepTitle = computed(() => {
  return step.value === 'identifier' ? t('otp.titleIdentifier') : t('otp.titleVerify');
});

const stepSubtitle = computed(() => {
  return step.value === 'identifier' ? t('otp.subtitleIdentifier') : t('otp.subtitleVerify');
});

async function handleRequestOtp(id: string): Promise<void> {
  identifier.value = id;
  try {
    // checkAuthMethod sets otpIdentifier in store; then requestOtp sends the code
    const method = await authStore.checkAuthMethod(id);
    if (method !== 'otp') {
      requestFormRef.value?.setError(t('auth.otp.passwordNotSupported'));
      return;
    }
    // Default to first available channel, or email
    const firstChannel = authStore.otp.channels[0]?.channel ?? 'email';
    await authStore.requestOtp(firstChannel);
    otpChannel.value = firstChannel;
    maskedDestination.value = authStore.otp.challenge?.masked_destination ?? '';
    step.value = 'otp';
    startResendCountdown();
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    requestFormRef.value?.setError(err.response?.data?.message ?? t('otp.errorSendingCode'));
  }
}

async function handleVerifyOtp(code: string): Promise<void> {
  try {
    await authStore.verifyOtp(code);
    $q.notify({ type: 'positive', message: t('otp.loginSuccess'), position: 'bottom' });
    void router.push('/dashboard');
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    verifyFormRef.value?.setError(err.response?.data?.message ?? t('otp.invalidCode'));
  }
}

async function handleResendOtp(): Promise<void> {
  if (!otpChannel.value) return;
  isResending.value = true;
  verifyFormRef.value?.reset();

  try {
    await authStore.requestOtp(otpChannel.value);
    maskedDestination.value = authStore.otp.challenge?.masked_destination ?? maskedDestination.value;
    startResendCountdown();
    $q.notify({ type: 'positive', message: t('otp.codeSent'), position: 'bottom' });
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message ?? t('otp.errorSendingCode'),
      position: 'bottom',
    });
  } finally {
    isResending.value = false;
  }
}

function goBackToIdentifier(): void {
  step.value = 'identifier';
  authStore.cancelOtp();
  stopResendCountdown();
}

function startResendCountdown(): void {
  resendCountdown.value = 60;
  stopResendCountdown();
  countdownInterval = setInterval(() => {
    resendCountdown.value--;
    if (resendCountdown.value <= 0) stopResendCountdown();
  }, 1000);
}

function stopResendCountdown(): void {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

onUnmounted(() => {
  stopResendCountdown();
  authStore.cancelOtp();
});
</script>

<style lang="sass" scoped>
$primary: #0066FF
$positive: #10B981
$negative: #EF4444

$gray-100: #F1F5F9
$gray-200: #E2E8F0
$gray-400: #94A3B8
$gray-500: #64748B
$gray-900: #0F172A

$radius-md: 12px

.otp-login
  padding: 24px

.step-indicator
  display: flex
  align-items: center
  justify-content: center
  gap: 8px
  margin-bottom: 24px

  &__item
    width: 28px
    height: 28px
    border-radius: 50%
    background: $gray-100
    display: flex
    align-items: center
    justify-content: center
    transition: all 0.3s ease

    &--active
      background: $primary
      .step-indicator__number
        color: white

    &--completed
      background: $positive
      .step-indicator__number
        color: white

  &__number
    font-size: 12px
    font-weight: 600
    color: $gray-400

  &__line
    width: 32px
    height: 2px
    background: $gray-200
    transition: background 0.3s ease

    &--active
      background: $positive

.step-header
  text-align: center
  margin-bottom: 24px

  &__icon
    width: 56px
    height: 56px
    margin: 0 auto 16px
    border-radius: $radius-md
    display: flex
    align-items: center
    justify-content: center
    font-size: 24px

    &--identifier
      background: rgba($primary, 0.1)
      color: $primary

    &--otp
      background: rgba(#F59E0B, 0.1)
      color: #F59E0B

  &__title
    margin: 0 0 4px
    font-size: 20px
    font-weight: 600
    color: $gray-900

  &__subtitle
    margin: 0
    font-size: 14px
    color: $gray-500
</style>
