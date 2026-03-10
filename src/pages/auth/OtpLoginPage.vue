<template>
  <div class="otp-login">
    <!-- Step Indicator -->
    <div class="step-indicator">
      <div class="step-indicator__item" :class="{ 'step-indicator__item--active': step === 'identifier', 'step-indicator__item--completed': step !== 'identifier' }">
        <span class="step-indicator__number">1</span>
      </div>
      <div class="step-indicator__line" :class="{ 'step-indicator__line--active': step !== 'identifier' }"></div>
      <div class="step-indicator__item" :class="{ 'step-indicator__item--active': step === 'otp', 'step-indicator__item--completed': step === 'entity-select' }">
        <span class="step-indicator__number">2</span>
      </div>
      <div class="step-indicator__line" :class="{ 'step-indicator__line--active': step === 'entity-select' }"></div>
      <div class="step-indicator__item" :class="{ 'step-indicator__item--active': step === 'entity-select' }">
        <span class="step-indicator__number">3</span>
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

    <!-- Step 1: Identifier Input -->
    <div v-if="step === 'identifier'" class="step-content">
      <q-form @submit.prevent="handleRequestOtp" class="form">
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

        <button type="submit" class="primary-btn" :disabled="!identifier.trim() || authStore.isLoading">
          <q-spinner-dots v-if="authStore.isLoading" color="white" size="20px" />
          <template v-else>
            {{ $t('common.continue') }}
            <q-icon name="las la-arrow-right" />
          </template>
        </button>
      </q-form>

      <div class="divider">
        <span class="divider__text">{{ $t('common.or') || 'or' }}</span>
      </div>

      <router-link to="/auth/login" class="secondary-link">
        <q-icon name="las la-key" />
        {{ $t('otp.usePassword') }}
      </router-link>
    </div>

    <!-- Step 2: OTP Verification -->
    <div v-else-if="step === 'otp'" class="step-content">
      <div class="otp-sent-info">
        <div class="otp-sent-info__icon">
          <q-icon :name="authStore.otpChannel === 'sms' ? 'las la-sms' : 'las la-envelope'" />
        </div>
        <span class="otp-sent-info__label">{{ $t('otp.sentTo') }}</span>
        <span class="otp-sent-info__value">{{ authStore.otpMaskedDestination }}</span>
      </div>

      <OtpInput
        ref="otpInputRef"
        v-model="otpCode"
        :has-error="!!otpError"
        :disabled="authStore.isLoading"
        class="otp-input-wrapper"
        @complete="handleVerifyOtp"
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
          @click="handleResendOtp"
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
        :disabled="otpCode.length !== 6 || authStore.isLoading"
        @click="handleVerifyOtp"
      >
        <q-spinner-dots v-if="authStore.isLoading" color="white" size="20px" />
        <template v-else>
          {{ $t('otp.verify') }}
          <q-icon name="las la-check" />
        </template>
      </button>

      <button class="back-btn" @click="goBackToIdentifier">
        <q-icon name="las la-arrow-left" />
        {{ $t('common.back') }}
      </button>
    </div>

    <!-- Step 3: Entity Selection -->
    <div v-else-if="step === 'entity-select'" class="step-content">
      <div class="entity-list">
        <div
          v-for="entity in authStore.customerEntities"
          :key="entity.id"
          class="entity-card"
          :class="{ 'entity-card--selected': selectedEntityId === entity.id }"
          @click="selectedEntityId = entity.id"
        >
          <div class="entity-card__avatar">
            <img v-if="entity.logo" :src="entity.logo" :alt="entity.name" />
            <span v-else>{{ entity.name.charAt(0).toUpperCase() }}</span>
          </div>
          <div class="entity-card__content">
            <h4 class="entity-card__name">{{ entity.name }}</h4>
            <span class="entity-card__account">
              {{ $t('otp.accountNumber') }}: {{ entity.customer_number }}
            </span>
          </div>
          <div v-if="selectedEntityId === entity.id" class="entity-card__check">
            <q-icon name="las la-check-circle" />
          </div>
        </div>
      </div>

      <button
        class="primary-btn"
        :disabled="!selectedEntityId"
        @click="handleSelectEntity"
      >
        {{ $t('common.continue') }}
        <q-icon name="las la-arrow-right" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/auth';
import OtpInput from 'src/components/auth/OtpInput.vue';

type LoginStep = 'identifier' | 'otp' | 'entity-select';

const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();
const authStore = useAuthStore();

// State
const step = ref<LoginStep>('identifier');
const identifier = ref('');
const identifierError = ref('');
const otpCode = ref('');
const otpError = ref('');
const selectedEntityId = ref<number | null>(null);
const resendCountdown = ref(0);
const isResending = ref(false);
const otpInputRef = ref<InstanceType<typeof OtpInput> | null>(null);

let countdownInterval: ReturnType<typeof setInterval> | null = null;

// Computed
const stepIcon = computed(() => {
  switch (step.value) {
    case 'identifier':
      return 'las la-mobile-alt';
    case 'otp':
      return 'las la-shield-alt';
    case 'entity-select':
      return 'las la-building';
    default:
      return 'las la-sign-in-alt';
  }
});

const stepTitle = computed(() => {
  switch (step.value) {
    case 'identifier':
      return t('otp.titleIdentifier');
    case 'otp':
      return t('otp.titleVerify');
    case 'entity-select':
      return t('otp.titleSelectAccount');
    default:
      return t('auth.login');
  }
});

const stepSubtitle = computed(() => {
  switch (step.value) {
    case 'identifier':
      return t('otp.subtitleIdentifier');
    case 'otp':
      return t('otp.subtitleVerify');
    case 'entity-select':
      return t('otp.subtitleSelectAccount');
    default:
      return '';
  }
});

// Actions
async function handleRequestOtp() {
  if (!identifier.value.trim()) {
    identifierError.value = t('validation.required');
    return;
  }

  try {
    await authStore.requestOtp(identifier.value);
    step.value = 'otp';
    startResendCountdown();
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    identifierError.value = err.response?.data?.message || t('otp.errorSendingCode');
  }
}

async function handleVerifyOtp() {
  if (otpCode.value.length !== 6) return;

  otpError.value = '';

  try {
    const response = await authStore.verifyOtp(identifier.value, otpCode.value);

    if (response.entities.length > 1) {
      step.value = 'entity-select';
    } else {
      void authStore.initializePushNotifications();
      $q.notify({ type: 'positive', message: t('otp.loginSuccess'), position: 'bottom' });
      void router.push('/dashboard');
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    otpError.value = err.response?.data?.message || t('otp.invalidCode');
    otpCode.value = '';
    otpInputRef.value?.focus();
  }
}

async function handleResendOtp() {
  isResending.value = true;
  otpError.value = '';
  otpCode.value = '';

  try {
    await authStore.requestOtp(identifier.value);
    startResendCountdown();
    $q.notify({ type: 'positive', message: t('otp.codeSent'), position: 'bottom' });
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    $q.notify({ type: 'negative', message: err.response?.data?.message || t('otp.errorSendingCode'), position: 'bottom' });
  } finally {
    isResending.value = false;
  }
}

function handleSelectEntity() {
  if (!selectedEntityId.value) return;

  authStore.selectEntity(selectedEntityId.value);
  void authStore.initializePushNotifications();
  $q.notify({ type: 'positive', message: t('otp.loginSuccess'), position: 'bottom' });
  void router.push('/dashboard');
}

function goBackToIdentifier() {
  step.value = 'identifier';
  otpCode.value = '';
  otpError.value = '';
  authStore.clearOtpState();
  stopResendCountdown();
}

function startResendCountdown() {
  resendCountdown.value = 60;
  stopResendCountdown();

  countdownInterval = setInterval(() => {
    resendCountdown.value--;
    if (resendCountdown.value <= 0) {
      stopResendCountdown();
    }
  }, 1000);
}

function stopResendCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

onUnmounted(() => {
  stopResendCountdown();
  authStore.clearOtpState();
});
</script>

<style lang="sass" scoped>
$primary: #0066FF
$positive: #10B981
$negative: #EF4444

$gray-50: #F8FAFC
$gray-100: #F1F5F9
$gray-200: #E2E8F0
$gray-300: #CBD5E1
$gray-400: #94A3B8
$gray-500: #64748B
$gray-600: #475569
$gray-700: #334155
$gray-800: #1E293B
$gray-900: #0F172A

$radius-sm: 8px
$radius-md: 12px
$radius-lg: 16px
$radius-full: 9999px

.otp-login
  padding: 24px

// Step Indicator
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

// Step Header
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

    &--entity-select
      background: rgba($positive, 0.1)
      color: $positive

  &__title
    margin: 0 0 4px
    font-size: 20px
    font-weight: 600
    color: $gray-900

  &__subtitle
    margin: 0
    font-size: 14px
    color: $gray-500

// Step Content
.step-content
  display: flex
  flex-direction: column
  gap: 16px

// Form Styles
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

// Buttons
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

// Divider
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

// OTP Sent Info
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

// Error Message
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

// Resend Section
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

// Entity List
.entity-list
  display: flex
  flex-direction: column
  gap: 10px
  max-height: 280px
  overflow-y: auto
  margin-bottom: 8px

.entity-card
  display: flex
  align-items: center
  gap: 14px
  padding: 14px
  background: $gray-50
  border: 2px solid transparent
  border-radius: $radius-md
  cursor: pointer
  transition: all 0.2s ease

  &:hover
    border-color: $gray-200

  &--selected
    background: rgba($primary, 0.05)
    border-color: $primary

  &__avatar
    width: 44px
    height: 44px
    border-radius: $radius-sm
    background: $primary
    color: white
    display: flex
    align-items: center
    justify-content: center
    font-size: 18px
    font-weight: 600
    flex-shrink: 0
    overflow: hidden

    img
      width: 100%
      height: 100%
      object-fit: cover

  &__content
    flex: 1
    min-width: 0

  &__name
    margin: 0
    font-size: 14px
    font-weight: 600
    color: $gray-900

  &__account
    display: block
    font-size: 12px
    color: $gray-500
    margin-top: 2px

  &__check
    font-size: 22px
    color: $primary
</style>
