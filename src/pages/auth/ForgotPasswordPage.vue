<template>
  <div class="forgot-password-page">
    <div class="text-h5 q-mb-md">{{ $t('auth.forgotPassword') }}</div>

    <q-form @submit="handleSubmit" class="q-gutter-md">
      <p class="text-body2 text-grey">
        {{ $t('forgotPassword.hint') }}
      </p>

      <q-input
        v-model="email"
        :label="$t('forgotPassword.emailLabel')"
        type="email"
        outlined
        :error="!!error"
        :error-message="error"
      >
        <template #prepend>
          <q-icon name="las la-envelope" />
        </template>
      </q-input>

      <q-banner v-if="success" class="bg-positive text-white" rounded>
        <template #avatar>
          <q-icon name="las la-check-circle" />
        </template>
        {{ $t('forgotPassword.checkEmail') }}
      </q-banner>

      <q-btn
        type="submit"
        color="primary"
        class="full-width"
        size="lg"
        :loading="isLoading"
        :disable="isLoading || success"
      >
        {{ $t('forgotPassword.submit') }}
      </q-btn>

      <div class="text-center">
        <router-link to="/auth/login" class="text-primary">
          {{ $t('forgotPassword.backToLogin') }}
        </router-link>
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { authService } from 'src/services/auth.service';

const { t } = useI18n();

const email = ref('');
const error = ref('');
const success = ref(false);
const isLoading = ref(false);

async function handleSubmit(): Promise<void> {
  if (!email.value.trim()) {
    error.value = t('forgotPassword.emailRequired');
    return;
  }

  error.value = '';
  isLoading.value = true;

  try {
    await authService.forgotPassword(email.value);
    success.value = true;
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('forgotPassword.genericError');
  } finally {
    isLoading.value = false;
  }
}
</script>
