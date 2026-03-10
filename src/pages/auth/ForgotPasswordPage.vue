<template>
  <div class="forgot-password-page">
    <div class="text-h5 q-mb-md">{{ $t('auth.forgotPassword') }}</div>

    <q-form @submit="handleSubmit" class="q-gutter-md">
      <p class="text-body2 text-grey">
        Introdu adresa de email și îți vom trimite un link pentru resetarea parolei.
      </p>

      <q-input
        v-model="email"
        label="Email"
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
        Verifică-ți email-ul pentru instrucțiuni de resetare a parolei.
      </q-banner>

      <q-btn
        type="submit"
        color="primary"
        class="full-width"
        size="lg"
        :loading="isLoading"
        :disable="isLoading || success"
      >
        Trimite Link
      </q-btn>

      <div class="text-center">
        <router-link to="/auth/login" class="text-primary">
          {{ $t('common.back') }} la autentificare
        </router-link>
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { authService } from 'src/services/auth.service';

const email = ref('');
const error = ref('');
const success = ref(false);
const isLoading = ref(false);

async function handleSubmit(): Promise<void> {
  if (!email.value.trim()) {
    error.value = 'Introdu adresa de email';
    return;
  }

  error.value = '';
  isLoading.value = true;

  try {
    await authService.forgotPassword(email.value);
    success.value = true;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'A apărut o eroare';
  } finally {
    isLoading.value = false;
  }
}
</script>
