<template>
  <div class="reset-password-page">
    <!-- Invalid Link State -->
    <template v-if="!token || !email">
      <div class="text-center">
        <q-icon name="las la-exclamation-triangle" size="64px" color="warning" class="q-mb-md" />
        <div class="text-h5 q-mb-sm">{{ $t('auth.resetPassword.invalidLink') }}</div>
        <p class="text-body2 text-grey q-mb-lg">
          {{ $t('auth.resetPassword.invalidLinkMessage') }}
        </p>
        <q-btn
          color="primary"
          :label="$t('auth.resetPassword.requestNew')"
          to="/auth/forgot-password"
          no-caps
          unelevated
        />
      </div>
    </template>

    <!-- Reset Form -->
    <template v-else>
      <div class="text-h5 q-mb-sm">{{ $t('auth.resetPassword.title') }}</div>
      <p class="text-body2 text-grey q-mb-lg">{{ $t('auth.resetPassword.subtitle') }}</p>

      <q-form @submit="handleSubmit" class="q-gutter-md">
        <q-input
          v-model="form.password"
          :label="$t('auth.resetPassword.newPassword')"
          :type="showPassword ? 'text' : 'password'"
          :hint="$t('auth.resetPassword.requirements')"
          outlined
          :error="!!errors.password"
          :error-message="errors.password"
        >
          <template #prepend>
            <q-icon name="las la-lock" />
          </template>
          <template #append>
            <q-icon
              :name="showPassword ? 'las la-eye-slash' : 'las la-eye'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <q-input
          v-model="form.passwordConfirmation"
          :label="$t('auth.resetPassword.confirmPassword')"
          :type="showPasswordConfirm ? 'text' : 'password'"
          outlined
          :error="!!errors.passwordConfirmation"
          :error-message="errors.passwordConfirmation"
        >
          <template #prepend>
            <q-icon name="las la-lock" />
          </template>
          <template #append>
            <q-icon
              :name="showPasswordConfirm ? 'las la-eye-slash' : 'las la-eye'"
              class="cursor-pointer"
              @click="showPasswordConfirm = !showPasswordConfirm"
            />
          </template>
        </q-input>

        <q-banner v-if="error" class="bg-negative text-white" rounded>
          <template #avatar>
            <q-icon name="las la-exclamation-triangle" />
          </template>
          {{ error }}
        </q-banner>

        <q-btn
          type="submit"
          color="primary"
          class="full-width"
          size="lg"
          :loading="isLoading"
          :disable="isLoading"
          no-caps
          unelevated
        >
          {{ $t('auth.resetPassword.submit') }}
        </q-btn>

        <div class="text-center">
          <router-link to="/auth/login" class="text-primary">
            {{ $t('common.back') }} {{ $t('auth.login').toLowerCase() }}
          </router-link>
        </div>
      </q-form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { authService } from 'src/services/auth.service';
import { initializeApp } from 'src/boot/appInit';
import { useAuthStore } from 'src/stores/auth';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();
const authStore = useAuthStore();

// Get token and email from query params
const token = computed(() => route.query.token as string | undefined);
const email = computed(() => route.query.email as string | undefined);

const showPassword = ref(false);
const showPasswordConfirm = ref(false);
const isLoading = ref(false);
const error = ref('');

const form = reactive({
  password: '',
  passwordConfirmation: '',
});

const errors = reactive({
  password: '',
  passwordConfirmation: '',
});

function validate(): boolean {
  let isValid = true;
  errors.password = '';
  errors.passwordConfirmation = '';

  if (!form.password) {
    errors.password = t('auth.resetPassword.newPassword') + ' ' + t('common.error').toLowerCase();
    isValid = false;
  } else if (form.password.length < 8) {
    errors.password = t('auth.resetPassword.requirements');
    isValid = false;
  }

  if (!form.passwordConfirmation) {
    errors.passwordConfirmation = t('auth.resetPassword.confirmPassword') + ' ' + t('common.error').toLowerCase();
    isValid = false;
  } else if (form.password !== form.passwordConfirmation) {
    errors.passwordConfirmation = t('auth.resetPassword.passwordMismatch');
    isValid = false;
  }

  return isValid;
}

async function handleSubmit(): Promise<void> {
  if (!validate()) return;
  if (!token.value || !email.value) return;

  isLoading.value = true;
  error.value = '';

  try {
    // Reset password - returns tokens (logs user in)
    const tokens = await authService.resetPassword(
      token.value,
      email.value,
      form.password,
      form.passwordConfirmation
    );

    // Store tokens via auth store (updates reactive state + LocalStorage)
    if (tokens.access_token) {
      authStore.setTokens(tokens.access_token, tokens.refresh_token || null);

      // Show success message
      $q.notify({
        type: 'positive',
        message: t('auth.resetPassword.success'),
        icon: 'las la-check-circle',
      });

      // Initialize app and navigate to dashboard
      try {
        await initializeApp({ force: true });
      } catch (err) {
        console.error('[ResetPassword] App init error:', err);
      }

      void router.replace('/dashboard');
    }
  } catch (err) {
    console.error('[ResetPassword] Error:', err);
    error.value = t('auth.resetPassword.error');
  } finally {
    isLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.reset-password-page {
  width: 100%;
  max-width: 400px;
}
</style>
