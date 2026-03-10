<template>
  <div class="login-page">
    <!-- Step Indicator -->
    <div class="step-indicator">
      <div
        v-for="i in totalSteps"
        :key="i"
        class="step-dot"
        :class="{
          active: currentStepNumber === i,
          completed: currentStepNumber > i,
        }"
      ></div>
    </div>

    <!-- Single transition wrapper for all steps -->
    <transition name="slide-up" mode="out-in">
      <!-- Step 1: Enter Identifier -->
      <div v-if="currentStep === 1" key="step1" class="step-content">
        <div class="step-header">
          <h2 class="step-title">{{ $t('auth.otp.enterIdentifier') }}</h2>
          <p class="step-description">{{ $t('auth.otp.identifierHint') }}</p>
        </div>

        <q-form @submit.prevent="handleCheckMethod" class="step-form">
          <q-input
            v-model="identifier"
            :label="$t('auth.identifier')"
            outlined
            autofocus
            class="portal-input"
            :error="!!errors.identifier"
            :error-message="errors.identifier"
            @keyup.enter="handleCheckMethod"
          >
            <template #prepend>
              <q-icon name="las la-user" color="grey-6" />
            </template>
          </q-input>

          <q-banner
            v-if="authStore.error"
            class="error-banner q-mt-md"
            rounded
          >
            <template #avatar>
              <q-icon name="las la-exclamation-circle" color="negative" />
            </template>
            {{ authStore.error }}
          </q-banner>

          <q-btn
            type="submit"
            color="primary"
            class="full-width q-mt-lg portal-btn portal-btn--lg"
            :loading="authStore.isLoading"
            :disable="authStore.isLoading || !identifier.trim()"
            unelevated
          >
            {{ $t('auth.continue') }}
          </q-btn>
        </q-form>
      </div>

      <!-- Step 1b: Password Login (when OTP disabled) -->
      <div v-else-if="currentStep === 'password'" key="step-password" class="step-content">
        <div class="step-header">
          <h2 class="step-title">{{ $t('auth.login') }}</h2>
          <p class="step-description">{{ $t('auth.enterPassword') }}</p>
        </div>

        <!-- Current identifier display -->
        <div class="identifier-badge" @click="goToStep(1)">
          <q-icon name="las la-user" size="18px" />
          <span class="identifier-badge__text">{{ identifier }}</span>
          <q-icon name="las la-pen" size="14px" class="identifier-badge__edit" />
        </div>

        <q-form @submit.prevent="handlePasswordLogin" class="step-form">
          <q-input
            v-model="password"
            :label="$t('auth.password')"
            :type="showPassword ? 'text' : 'password'"
            outlined
            autofocus
            class="portal-input"
            :error="!!errors.password"
            :error-message="errors.password"
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

          <q-banner
            v-if="authStore.error"
            class="error-banner q-mt-md"
            rounded
          >
            <template #avatar>
              <q-icon name="las la-exclamation-circle" color="negative" />
            </template>
            {{ authStore.error }}
          </q-banner>

          <q-btn
            type="submit"
            color="primary"
            class="full-width q-mt-lg portal-btn portal-btn--lg"
            :loading="authStore.isLoading"
            :disable="authStore.isLoading || !password"
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

      <!-- Step 2: Choose Channel -->
      <div v-else-if="currentStep === 2" key="step2" class="step-content">
        <div class="step-header">
          <h2 class="step-title">{{ $t('auth.otp.chooseChannel') }}</h2>
          <p class="step-description">{{ $t('auth.otp.channelHint') }}</p>
        </div>

        <!-- Current identifier display -->
        <div class="identifier-badge" @click="goToStep(1)">
          <q-icon name="las la-user" size="18px" />
          <span class="identifier-badge__text">{{ identifier }}</span>
          <q-icon name="las la-pen" size="14px" class="identifier-badge__edit" />
        </div>

        <div class="channel-list">
          <div
            v-for="channel in authStore.otp.channels"
            :key="channel.channel"
            class="channel-option"
            :class="{ loading: loadingChannel === channel.channel }"
            @click="selectChannel(channel.channel)"
          >
            <div class="channel-option__icon">
              <q-icon :name="getChannelIcon(channel.channel)" size="24px" />
            </div>
            <div class="channel-option__content">
              <div class="channel-option__label">
                {{ $t(`auth.otp.channel.${channel.channel}`) }}
              </div>
              <div class="channel-option__destination">
                {{ channel.masked_destination }}
              </div>
            </div>
            <div class="channel-option__action">
              <q-spinner
                v-if="loadingChannel === channel.channel"
                color="primary"
                size="20px"
              />
              <q-icon v-else name="las la-chevron-right" size="20px" />
            </div>
          </div>
        </div>

        <q-banner
          v-if="authStore.error"
          class="error-banner q-mt-md"
          rounded
        >
          <template #avatar>
            <q-icon name="las la-exclamation-circle" color="negative" />
          </template>
          {{ authStore.error }}
        </q-banner>
      </div>

      <!-- Step 3: Enter OTP Code -->
      <div v-else-if="currentStep === 3" key="step3" class="step-content">
        <div class="step-header">
          <h2 class="step-title">{{ $t('auth.otp.enterCode') }}</h2>
          <p class="step-description">
            {{ $t('auth.otp.codeSentTo', { destination: authStore.otp.challenge?.masked_destination }) }}
          </p>
        </div>

        <!-- OTP Input -->
        <div class="otp-container">
          <q-input
            v-for="(_, index) in 6"
            :key="index"
            ref="otpInputRefs"
            v-model="codeDigits[index]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            outlined
            dense
            class="otp-digit"
            :error="!!otpError"
            @update:model-value="handleOtpInput(index)"
            @keydown="handleOtpKeydown($event, index)"
            @paste="handleOtpPaste"
            @focus="handleOtpFocus(index)"
          />
        </div>

        <div v-if="otpError" class="otp-error">
          {{ otpError }}
        </div>

        <q-btn
          color="primary"
          class="full-width q-mt-lg portal-btn portal-btn--lg"
          :loading="authStore.isLoading"
          :disable="!isCodeComplete || authStore.isLoading"
          unelevated
          @click="handleVerifyOtp"
        >
          {{ $t('auth.otp.verify') }}
        </q-btn>

        <!-- Resend & Back actions -->
        <div class="step-actions">
          <q-btn
            flat
            dense
            color="grey-7"
            class="step-action-btn"
            @click="goToStep(2)"
          >
            <q-icon name="las la-arrow-left" size="18px" class="q-mr-xs" />
            {{ $t('common.back') }}
          </q-btn>

          <q-btn
            flat
            dense
            :color="resendCooldown > 0 ? 'grey-5' : 'primary'"
            class="step-action-btn"
            :disable="resendCooldown > 0"
            @click="resendOtp"
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
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { initializeApp } from 'src/boot/appInit';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const $q = useQuasar();
const { t } = useI18n();

// Step tracking (1: identifier, 'password': password login, 2: channel, 3: code)
type LoginStep = 1 | 'password' | 2 | 3;
const currentStep = ref<LoginStep>(1);

// Form state
const identifier = ref('');
const password = ref('');
const showPassword = ref(false);
const loadingChannel = ref<string | null>(null);

// OTP code input
const codeDigits = ref(['', '', '', '', '', '']);
const otpInputRefs = ref<HTMLInputElement[]>([]);
const otpError = ref('');
const resendCooldown = ref(0);
let cooldownInterval: ReturnType<typeof setInterval> | null = null;

const errors = ref({
  identifier: '',
  password: '',
});

// Computed
const isCodeComplete = computed(() => codeDigits.value.every((d) => d !== ''));
const fullCode = computed(() => codeDigits.value.join(''));

// Step indicator - password flow has 2 steps, OTP flow has 3 steps
const totalSteps = computed(() => (currentStep.value === 'password' ? 2 : 3));
const currentStepNumber = computed(() => {
  if (currentStep.value === 1) return 1;
  if (currentStep.value === 'password') return 2;
  if (currentStep.value === 2) return 2;
  if (currentStep.value === 3) return 3;
  return 1;
});

// Auto-verify when code is complete
watch(isCodeComplete, (complete) => {
  if (complete && !authStore.isLoading && currentStep.value === 3) {
    void nextTick().then(() => {
      void handleVerifyOtp();
    });
  }
});

// Watch for OTP required state (channels received)
watch(
  () => authStore.otpRequired,
  (required) => {
    if (required && authStore.otp.channels.length > 0) {
      currentStep.value = 2;
    }
  }
);

// Watch for OTP challenge (code sent)
watch(
  () => authStore.otp.challenge,
  (challenge) => {
    if (challenge) {
      currentStep.value = 3;
      startResendCooldown();
      // Focus first OTP input
      void nextTick().then(() => {
        focusOtpInput(0);
      });
    }
  }
);

// Helper functions
function getChannelIcon(channel: string): string {
  return channel === 'sms' ? 'las la-mobile' : 'las la-envelope';
}

function goToStep(step: LoginStep): void {
  if (step === 1) {
    authStore.cancelOtp();
    password.value = '';
    codeDigits.value = ['', '', '', '', '', ''];
    otpError.value = '';
    errors.value.password = '';
    stopResendCooldown();
  } else if (step === 2) {
    authStore.otpGoBack();
    codeDigits.value = ['', '', '', '', '', ''];
    otpError.value = '';
    stopResendCooldown();
  }
  currentStep.value = step;
}

// Step 1: Check auth method
async function handleCheckMethod(): Promise<void> {
  errors.value.identifier = '';

  if (!identifier.value.trim()) {
    errors.value.identifier = t('validation.required');
    return;
  }

  try {
    const method = await authStore.checkAuthMethod(identifier.value);

    if (method === 'otp') {
      // OTP required - go to channel selection
      currentStep.value = 2;
    } else {
      // Password login - go to password step
      currentStep.value = 'password';
    }
  } catch {
    // Error is handled by the store
  }
}

// Password login (when OTP is disabled for entity)
async function handlePasswordLogin(): Promise<void> {
  errors.value.password = '';

  if (!password.value) {
    errors.value.password = t('validation.required');
    return;
  }

  try {
    const result = await authStore.login({
      identifier: identifier.value,
      password: password.value,
    });

    if (!result.requiresMfa) {
      // Login successful - initialize app and navigate
      await completeLogin();
    }
    // If MFA required, the store will handle it
  } catch {
    // Error is handled by the store
  }
}

// Step 2: Select OTP channel
async function selectChannel(channel: 'sms' | 'email'): Promise<void> {
  loadingChannel.value = channel;
  otpError.value = '';

  try {
    await authStore.requestOtp(channel);
    // Watch will transition to step 3
  } catch {
    // Error is handled by the store
  } finally {
    loadingChannel.value = null;
  }
}

// Step 3: Verify OTP code
async function handleVerifyOtp(): Promise<void> {
  if (!isCodeComplete.value) return;

  otpError.value = '';

  try {
    await authStore.verifyOtp(fullCode.value);
    // Login successful - initialize app and navigate
    await completeLogin();
  } catch (err) {
    otpError.value = err instanceof Error ? err.message : t('auth.otp.invalidCode');
    codeDigits.value = ['', '', '', '', '', ''];
    await nextTick();
    focusOtpInput(0);
  }
}

// Complete login flow
async function completeLogin(): Promise<void> {
  try {
    await initializeApp({ force: true });
  } catch (err) {
    console.error('[Login] App init error:', err);
  }
  const redirectPath = (route.query.redirect as string) || '/dashboard';
  void router.replace(redirectPath);
}

// Resend OTP
async function resendOtp(): Promise<void> {
  if (resendCooldown.value > 0 || !authStore.otp.selectedChannel) return;

  try {
    await authStore.requestOtp(authStore.otp.selectedChannel);
    startResendCooldown();
    $q.notify({
      type: 'positive',
      message: t('auth.otp.codeSent'),
    });
  } catch {
    // Error is handled by the store
  }
}

// OTP input handling
function focusOtpInput(index: number): void {
  const inputs = document.querySelectorAll('.otp-digit input');
  (inputs[index] as HTMLInputElement)?.focus();
}

function handleOtpInput(index: number): void {
  const value = codeDigits.value[index];
  if (value && !/^\d$/.test(value)) {
    codeDigits.value[index] = '';
    return;
  }
  otpError.value = '';
  if (value && index < 5) {
    focusOtpInput(index + 1);
  }
}

function handleOtpKeydown(event: KeyboardEvent, index: number): void {
  if (event.key === 'Backspace') {
    if (!codeDigits.value[index] && index > 0) {
      focusOtpInput(index - 1);
      codeDigits.value[index - 1] = '';
    }
  } else if (event.key === 'ArrowLeft' && index > 0) {
    focusOtpInput(index - 1);
  } else if (event.key === 'ArrowRight' && index < 5) {
    focusOtpInput(index + 1);
  }
}

function handleOtpPaste(event: ClipboardEvent): void {
  event.preventDefault();
  const pastedData = event.clipboardData?.getData('text')?.trim() || '';
  const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');
  digits.forEach((digit, i) => {
    codeDigits.value[i] = digit;
  });
  otpError.value = '';
  // Focus the next empty input or the last one
  const nextEmpty = codeDigits.value.findIndex((d) => !d);
  focusOtpInput(nextEmpty === -1 ? 5 : nextEmpty);
}

function handleOtpFocus(index: number): void {
  // Select all text when focusing
  const inputs = document.querySelectorAll('.otp-digit input');
  (inputs[index] as HTMLInputElement)?.select();
}

// Cooldown management
function startResendCooldown(): void {
  resendCooldown.value = 60;
  stopResendCooldown();
  cooldownInterval = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      stopResendCooldown();
    }
  }, 1000);
}

function stopResendCooldown(): void {
  if (cooldownInterval) {
    clearInterval(cooldownInterval);
    cooldownInterval = null;
  }
}

onUnmounted(() => {
  stopResendCooldown();
});
</script>

<style lang="sass" scoped>
.login-page
  width: 100%

.step-indicator
  display: flex
  justify-content: center
  gap: var(--space-sm)
  margin-bottom: var(--space-xl)

.step-dot
  width: 8px
  height: 8px
  border-radius: var(--radius-full)
  background-color: var(--color-border)
  transition: all var(--transition-normal)

  &.active
    background-color: var(--color-primary)
    width: 24px

  &.completed
    background-color: var(--color-primary)

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

// Identifier badge (shown in step 2 & 3)
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

// Channel selection
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

  &:hover:not(.loading)
    border-color: var(--color-primary-light)
    background-color: rgba(37, 99, 235, 0.02)

  &.loading
    opacity: 0.7
    cursor: wait

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
  margin-bottom: 2px

.channel-option__destination
  font-size: 0.8125rem
  color: var(--color-text-secondary)

.channel-option__action
  color: var(--color-text-muted)

// OTP input
.otp-container
  display: flex
  justify-content: center
  gap: var(--space-sm)
  margin-bottom: var(--space-md)

.otp-digit
  width: 48px

  :deep(input)
    text-align: center
    font-size: 1.5rem
    font-weight: 600
    padding: 12px 0

  :deep(.q-field__control)
    border-radius: var(--radius-md)

  &:deep(.q-field--focused .q-field__control)
    border-color: var(--color-primary)
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1)

  @media (max-width: 380px)
    width: 42px

    :deep(input)
      font-size: 1.25rem
      padding: 10px 0

.otp-error
  text-align: center
  color: var(--q-negative)
  font-size: 0.875rem
  margin-bottom: var(--space-sm)

// Step actions (back & resend)
.step-actions
  display: flex
  justify-content: space-between
  margin-top: var(--space-lg)

.step-action-btn
  font-size: 0.8125rem
  font-weight: 500
  text-transform: none

// Error banner
.error-banner
  background: #FEF2F2
  border: 1px solid #FECACA
  color: #991B1B

// Forgot password link
.forgot-link
  color: var(--color-text-secondary)
  text-decoration: none
  font-size: 0.875rem
  transition: color var(--transition-fast)

  &:hover
    color: var(--color-primary)

// Portal button customization
.portal-btn
  border-radius: var(--radius-md)
  font-weight: 500
  text-transform: none
  letter-spacing: 0

.portal-btn--lg
  padding: 14px 24px
  font-size: 1rem

// Transitions
.slide-up-enter-active,
.slide-up-leave-active
  transition: all var(--transition-normal)

.slide-up-enter-from
  opacity: 0
  transform: translateY(16px)

.slide-up-leave-to
  opacity: 0
  transform: translateY(-16px)
</style>
