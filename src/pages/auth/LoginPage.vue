<template>
  <div class="login-page">
    <!-- Step Indicator -->
    <div class="step-indicator" role="progressbar" :aria-valuenow="currentStepNumber" :aria-valuemin="1" :aria-valuemax="totalSteps" :aria-label="$t('auth.stepOf', { current: currentStepNumber, total: totalSteps })">
      <div
        v-for="i in totalSteps"
        :key="i"
        class="step-dot"
        :class="{
          active: currentStepNumber === i,
          completed: currentStepNumber > i,
        }"
        aria-hidden="true"
      ></div>
    </div>

    <transition name="slide-up" mode="out-in">
      <LoginEmailStep
        v-if="currentStep === 1"
        key="step1"
        :loading="authStore.isLoading"
        :store-error="authStore.error"
        @submit="handleCheckMethod"
      />

      <LoginPasswordStep
        v-else-if="currentStep === 'password'"
        key="step-password"
        ref="passwordStepRef"
        :identifier="identifier"
        :loading="authStore.isLoading"
        :store-error="authStore.error"
        @back="goToStep(1)"
        @submit="handlePasswordLogin"
      />

      <LoginOtpStep
        v-else-if="currentStep === 2"
        key="step2"
        :identifier="identifier"
        :channels="authStore.otp.channels"
        :store-error="authStore.error"
        @back="goToStep(1)"
        @select="selectChannel"
      />

      <LoginOtpCodeStep
        v-else-if="currentStep === 3"
        key="step3"
        ref="otpCodeStepRef"
        :masked-destination="authStore.otp.challenge?.masked_destination"
        :loading="authStore.isLoading"
        :resend-cooldown="resendCooldown"
        @back="goToStep(2)"
        @resend="resendOtp"
        @verify="handleVerifyOtp"
      />

      <LoginMfaStep
        v-else-if="currentStep === 'mfa'"
        key="step-mfa"
        ref="mfaStepRef"
        :methods="authStore.mfa.methods"
        :challenge="authStore.mfa.challenge"
        :loading="authStore.isLoading"
        :store-error="authStore.error"
        @request-challenge="authStore.requestMfaChallenge"
        @verify="handleVerifyMfa"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { initializeApp } from 'src/boot/appInit';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import LoginEmailStep from './components/LoginEmailStep.vue';
import LoginPasswordStep from './components/LoginPasswordStep.vue';
import LoginOtpStep from './components/LoginOtpStep.vue';
import LoginOtpCodeStep from './components/LoginOtpCodeStep.vue';
import LoginMfaStep from './components/LoginMfaStep.vue';

defineOptions({ name: 'LoginPage' });

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const $q = useQuasar();
const { t } = useI18n();

type LoginStep = 1 | 'password' | 2 | 3 | 'mfa';
const currentStep = ref<LoginStep>(1);
const identifier = ref('');

const passwordStepRef = ref<InstanceType<typeof LoginPasswordStep> | null>(null);
const otpCodeStepRef = ref<InstanceType<typeof LoginOtpCodeStep> | null>(null);
const mfaStepRef = ref<InstanceType<typeof LoginMfaStep> | null>(null);

const resendCooldown = ref(0);
let cooldownInterval: ReturnType<typeof setInterval> | null = null;

const totalSteps = computed(() => (currentStep.value === 'password' || currentStep.value === 'mfa' ? 2 : 3));
const currentStepNumber = computed(() => {
  if (currentStep.value === 1) return 1;
  if (currentStep.value === 'password' || currentStep.value === 2) return 2;
  if (currentStep.value === 3 || currentStep.value === 'mfa') return 3;
  return 1;
});

watch(
  () => authStore.otp.challenge,
  (challenge) => {
    if (challenge) {
      currentStep.value = 3;
      startResendCooldown();
    }
  },
);

watch(
  () => authStore.mfa.required,
  (required) => {
    if (required) {
      currentStep.value = 'mfa';
      if (authStore.mfa.methods.length === 1 && authStore.mfa.methods[0]) {
        void authStore.requestMfaChallenge(authStore.mfa.methods[0].method);
      }
    }
  },
);

function goToStep(step: LoginStep): void {
  if (step === 1) {
    authStore.cancelOtp();
    passwordStepRef.value?.reset();
    otpCodeStepRef.value?.reset();
    stopResendCooldown();
  } else if (step === 2) {
    authStore.otpGoBack();
    otpCodeStepRef.value?.reset();
    stopResendCooldown();
  }
  currentStep.value = step;
}

async function handleCheckMethod(id: string): Promise<void> {
  identifier.value = id;
  try {
    const method = await authStore.checkAuthMethod(id);
    currentStep.value = method === 'otp' ? 2 : 'password';
  } catch {
    // error displayed via authStore.error
  }
}

async function handlePasswordLogin(password: string): Promise<void> {
  try {
    const result = await authStore.login({ identifier: identifier.value, password });
    if (!result.requiresMfa) {
      await completeLogin();
    }
  } catch {
    // error displayed via authStore.error
  }
}

async function selectChannel(channel: 'sms' | 'email'): Promise<void> {
  try {
    await authStore.requestOtp(channel);
  } catch {
    // error displayed via authStore.error
  }
}

async function handleVerifyOtp(code: string): Promise<void> {
  try {
    await authStore.verifyOtp(code);
    await completeLogin();
  } catch (err) {
    const msg = err instanceof Error ? err.message : t('auth.otp.invalidCode');
    otpCodeStepRef.value?.setError(msg);
  }
}

async function handleVerifyMfa(code: string, trustDevice: boolean): Promise<void> {
  try {
    await authStore.verifyMfaCode(code, trustDevice);
    await completeLogin();
  } catch (err) {
    const msg = err instanceof Error ? err.message : t('auth.mfa.invalidCode');
    mfaStepRef.value?.setError(msg);
  }
}

async function completeLogin(): Promise<void> {
  try {
    await initializeApp({ force: true });
  } catch (err) {
    console.error('[Login] App init error:', err);
  }
  const redirectPath = (route.query.redirect as string) || '/dashboard';
  void router.replace(redirectPath);
}

async function resendOtp(): Promise<void> {
  if (resendCooldown.value > 0 || !authStore.otp.selectedChannel) return;
  try {
    await authStore.requestOtp(authStore.otp.selectedChannel);
    startResendCooldown();
    $q.notify({ type: 'positive', message: t('auth.otp.codeSent') });
  } catch {
    // error displayed via authStore.error
  }
}

function startResendCooldown(): void {
  resendCooldown.value = 60;
  stopResendCooldown();
  cooldownInterval = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) stopResendCooldown();
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
