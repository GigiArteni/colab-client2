<template>
  <div class="mfa-verification">
    <div class="text-h5 q-mb-md">{{ $t('auth.mfa.title') }}</div>

    <!-- Method Selection -->
    <div v-if="!authStore.mfa.selectedMethod" class="method-selection">
      <p class="text-body1 q-mb-md">{{ $t('auth.mfa.selectMethod') }}</p>

      <div class="row q-gutter-sm q-mb-lg">
        <q-btn
          v-for="method in authStore.mfa.methods"
          :key="method.method"
          outline
          :loading="loadingMethod === method.method"
          class="col"
          @click="selectMethod(method.method)"
        >
          <q-icon :name="getMethodIcon(method.method)" left />
          {{ method.label }}
        </q-btn>
      </div>

      <q-btn flat color="grey" @click="cancel">
        {{ $t('common.cancel') }}
      </q-btn>
    </div>

    <!-- Code Entry -->
    <div v-else class="code-entry">
      <p class="text-body1 q-mb-md">
        <template v-if="authStore.mfa.challenge?.masked_destination">
          {{ $t('auth.mfa.codeSentTo', { destination: authStore.mfa.challenge.masked_destination }) }}
        </template>
        <template v-else-if="authStore.mfa.selectedMethod === 'totp'">
          {{ $t('auth.mfa.enterTotpCode') }}
        </template>
        <template v-else>
          {{ $t('auth.mfa.enterCode') }}
        </template>
      </p>

      <!-- OTP Input -->
      <div class="otp-inputs row justify-center q-gutter-sm q-mb-md">
        <q-input
          v-for="(_, index) in 6"
          :key="index"
          ref="otpInputs"
          v-model="codeDigits[index]"
          type="text"
          inputmode="numeric"
          maxlength="1"
          outlined
          dense
          class="otp-input"
          :error="!!error"
          @update:model-value="handleInput(index)"
          @keydown="handleKeydown($event, index)"
          @paste="handlePaste"
        />
      </div>

      <div v-if="error" class="text-negative text-center q-mb-md">{{ error }}</div>

      <q-checkbox v-model="trustDevice" :label="$t('auth.mfa.trustDevice')" class="q-mb-md" />

      <q-btn
        color="primary"
        class="full-width q-mb-md"
        size="lg"
        :loading="authStore.isLoading"
        :disable="!isCodeComplete"
        @click="verifyCode"
      >
        {{ $t('auth.mfa.verify') }}
      </q-btn>

      <div class="row justify-between">
        <q-btn flat color="grey" @click="goBack">
          <q-icon name="las la-arrow-left" left />
          {{ $t('common.back') }}
        </q-btn>

        <q-btn
          v-if="authStore.mfa.selectedMethod !== 'totp'"
          flat
          color="primary"
          :disable="resendCooldown > 0"
          @click="resendCode"
        >
          <template v-if="resendCooldown > 0">
            {{ $t('auth.mfa.resendIn', { seconds: resendCooldown }) }}
          </template>
          <template v-else>
            {{ $t('auth.mfa.resendCode') }}
          </template>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { initializeApp } from 'src/boot/appInit';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const loadingMethod = ref<string | null>(null);
const codeDigits = ref(['', '', '', '', '', '']);
const trustDevice = ref(false);
const error = ref('');
const resendCooldown = ref(0);
const otpInputs = ref<HTMLInputElement[]>([]);
let cooldownInterval: ReturnType<typeof setInterval> | null = null;

const isCodeComplete = computed(() => codeDigits.value.every(d => d !== ''));
const fullCode = computed(() => codeDigits.value.join(''));

watch(isCodeComplete, (complete) => {
  if (complete && !authStore.isLoading) {
    void nextTick().then(() => {
      void verifyCode();
    });
  }
});

function getMethodIcon(method: string): string {
  const icons: Record<string, string> = {
    totp: 'las la-mobile',
    sms: 'las la-sms',
    email: 'las la-envelope',
  };
  return icons[method] || 'las la-key';
}

function handleInput(index: number): void {
  const value = codeDigits.value[index];
  if (value && !/^\d$/.test(value)) {
    codeDigits.value[index] = '';
    return;
  }
  error.value = '';
  if (value && index < 5) {
    const inputs = document.querySelectorAll('.otp-input input');
    (inputs[index + 1] as HTMLInputElement)?.focus();
  }
}

function handleKeydown(event: KeyboardEvent, index: number): void {
  if (event.key === 'Backspace') {
    if (!codeDigits.value[index] && index > 0) {
      const inputs = document.querySelectorAll('.otp-input input');
      (inputs[index - 1] as HTMLInputElement)?.focus();
      codeDigits.value[index - 1] = '';
    }
  }
}

function handlePaste(event: ClipboardEvent): void {
  event.preventDefault();
  const pastedData = event.clipboardData?.getData('text')?.trim() || '';
  const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');
  digits.forEach((digit, i) => {
    codeDigits.value[i] = digit;
  });
  error.value = '';
}

async function selectMethod(method: string): Promise<void> {
  loadingMethod.value = method;
  error.value = '';

  try {
    if (method === 'totp') {
      // For TOTP, just set the method without requesting challenge
      authStore.mfa.selectedMethod = method;
    } else {
      await authStore.requestMfaChallenge(method);
      startResendCooldown();
    }
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : t('auth.mfa.challengeError'),
    });
  } finally {
    loadingMethod.value = null;
  }
}

async function verifyCode(): Promise<void> {
  if (!isCodeComplete.value) return;

  error.value = '';

  try {
    await authStore.verifyMfaCode(fullCode.value, trustDevice.value);

    // Initialize app after successful login
    await initializeApp({ force: true });

    // Navigate to dashboard
    await router.push({ name: 'dashboard' });
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('auth.mfa.invalidCode');
    codeDigits.value = ['', '', '', '', '', ''];
    await nextTick();
    const inputs = document.querySelectorAll('.otp-input input');
    (inputs[0] as HTMLInputElement)?.focus();
  }
}

async function resendCode(): Promise<void> {
  if (resendCooldown.value > 0 || !authStore.mfa.selectedMethod) return;

  try {
    await authStore.requestMfaChallenge(authStore.mfa.selectedMethod);
    startResendCooldown();
    $q.notify({
      type: 'positive',
      message: t('auth.mfa.codeResent'),
    });
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : t('auth.mfa.resendError'),
    });
  }
}

function goBack(): void {
  authStore.mfa.selectedMethod = null;
  authStore.mfa.challenge = null;
  codeDigits.value = ['', '', '', '', '', ''];
  error.value = '';
  stopResendCooldown();
}

function cancel(): void {
  authStore.cancelMfa();
}

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
.otp-input
  width: 48px

  :deep(input)
    text-align: center
    font-size: 1.5rem
    font-weight: 600
</style>
