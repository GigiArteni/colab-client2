<template>
  <div class="accept-invite">
    <!-- Loading State -->
    <div v-if="isLoadingInvite" class="state-container">
      <div class="state-icon state-icon--loading">
        <q-spinner-dots color="primary" size="40px" />
      </div>
      <p class="state-text">{{ $t('common.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="inviteError" class="state-container">
      <div class="state-icon state-icon--error">
        <q-icon name="las la-exclamation-circle" />
      </div>
      <h3 class="state-title state-title--error">{{ inviteError }}</h3>
      <router-link to="/auth/otp" class="primary-btn primary-btn--outline">
        <q-icon name="las la-arrow-left" />
        {{ $t('auth.backToLogin') }}
      </router-link>
    </div>

    <!-- Success State -->
    <div v-else-if="isAccepted" class="state-container">
      <div class="state-icon state-icon--success">
        <q-icon name="las la-check-circle" />
      </div>
      <h3 class="state-title state-title--success">{{ $t('invite.accepted') }}</h3>
      <p class="state-text">{{ $t('auth.canNowLogin') }}</p>
      <router-link to="/auth/otp" class="primary-btn">
        {{ $t('auth.login') }}
        <q-icon name="las la-arrow-right" />
      </router-link>
    </div>

    <!-- Invite Form -->
    <template v-else-if="invite">
      <!-- Header -->
      <header class="invite-header">
        <div class="invite-header__avatar">
          <img v-if="invite.entity?.logo" :src="invite.entity.logo" :alt="invite.entity.name" />
          <span v-else>{{ invite.entity?.name?.charAt(0) || 'C' }}</span>
        </div>
        <h2 class="invite-header__title">{{ $t('invite.welcome') }}!</h2>
        <p class="invite-header__subtitle">{{ $t('invite.subtitle') }}</p>
        <span class="invite-header__entity">{{ invite.entity?.name }}</span>
      </header>

      <!-- Form -->
      <q-form @submit.prevent="handleAcceptInvite" class="form">
        <!-- Email (readonly) -->
        <div class="form-group">
          <label class="form-label">{{ $t('profile.email') }}</label>
          <div class="input-wrapper">
            <q-icon name="las la-envelope" class="input-icon" />
            <q-input
              :model-value="invite.email"
              outlined
              dense
              readonly
              disable
              class="custom-input custom-input--readonly"
            />
          </div>
        </div>

        <!-- First Name -->
        <div class="form-group">
          <label class="form-label">{{ $t('invite.firstName') }} *</label>
          <div class="input-wrapper">
            <q-icon name="las la-user" class="input-icon" />
            <q-input
              v-model="form.first_name"
              outlined
              dense
              class="custom-input"
              :rules="[val => !!val || $t('validation.required')]"
            />
          </div>
        </div>

        <!-- Last Name -->
        <div class="form-group">
          <label class="form-label">{{ $t('invite.lastName') }} *</label>
          <div class="input-wrapper">
            <q-icon name="las la-user" class="input-icon" />
            <q-input
              v-model="form.last_name"
              outlined
              dense
              class="custom-input"
              :rules="[val => !!val || $t('validation.required')]"
            />
          </div>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label class="form-label">{{ $t('invite.password') }} *</label>
          <div class="input-wrapper">
            <q-icon name="las la-lock" class="input-icon" />
            <q-input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              outlined
              dense
              class="custom-input"
              :hint="$t('invite.passwordHint')"
              :rules="[
                val => !!val || $t('validation.required'),
                val => val.length >= 8 || $t('validation.minLength', { min: 8 })
              ]"
            >
              <template #append>
                <q-icon
                  :name="showPassword ? 'las la-eye-slash' : 'las la-eye'"
                  class="cursor-pointer toggle-visibility"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Confirm Password -->
        <div class="form-group">
          <label class="form-label">{{ $t('invite.confirmPassword') }} *</label>
          <div class="input-wrapper">
            <q-icon name="las la-lock" class="input-icon" />
            <q-input
              v-model="form.password_confirmation"
              :type="showConfirmPassword ? 'text' : 'password'"
              outlined
              dense
              class="custom-input"
              :rules="[
                val => !!val || $t('validation.required'),
                val => val === form.password || $t('validation.passwordMatch')
              ]"
            >
              <template #append>
                <q-icon
                  :name="showConfirmPassword ? 'las la-eye-slash' : 'las la-eye'"
                  class="cursor-pointer toggle-visibility"
                  @click="showConfirmPassword = !showConfirmPassword"
                />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="submitError" class="error-message">
          <q-icon name="las la-exclamation-circle" />
          {{ submitError }}
        </div>

        <!-- Submit button -->
        <button type="submit" class="primary-btn" :disabled="authStore.isLoading">
          <q-spinner-dots v-if="authStore.isLoading" color="white" size="20px" />
          <template v-else>
            {{ $t('invite.createAccount') }}
            <q-icon name="las la-arrow-right" />
          </template>
        </button>
      </q-form>

      <!-- Back to login -->
      <div class="footer-link">
        <router-link to="/auth/otp" class="secondary-link">
          {{ $t('auth.backToLogin') }}
        </router-link>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/auth';
import type { InviteInfo, AcceptInviteRequest } from 'src/types';

const route = useRoute();
const $q = useQuasar();
const { t } = useI18n();
const authStore = useAuthStore();

// State
const invite = ref<InviteInfo | null>(null);
const isLoadingInvite = ref(true);
const inviteError = ref('');
const isAccepted = ref(false);
const submitError = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const form = ref<AcceptInviteRequest>({
  password: '',
  password_confirmation: '',
  first_name: '',
  last_name: '',
});

// Load invite on mount
onMounted(async () => {
  const token = route.params.token as string;

  if (!token) {
    inviteError.value = t('invite.invalid');
    isLoadingInvite.value = false;
    return;
  }

  try {
    const inviteData = await authStore.getInvite(token);

    if (!inviteData) {
      inviteError.value = t('invite.invalid');
      return;
    }

    if (inviteData.status === 'expired') {
      inviteError.value = t('invite.expired');
      return;
    }

    if (inviteData.status === 'accepted') {
      inviteError.value = t('invite.alreadyAccepted');
      return;
    }

    invite.value = inviteData;

    // Pre-fill name if provided
    if (inviteData.first_name) {
      form.value.first_name = inviteData.first_name;
    }
    if (inviteData.last_name) {
      form.value.last_name = inviteData.last_name;
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    inviteError.value = err.response?.data?.message || t('invite.invalid');
  } finally {
    isLoadingInvite.value = false;
  }
});

async function handleAcceptInvite() {
  const token = route.params.token as string;
  submitError.value = '';

  try {
    const success = await authStore.acceptInvite(token, form.value);

    if (success) {
      isAccepted.value = true;
      $q.notify({
        type: 'positive',
        message: t('invite.accepted'),
        position: 'bottom',
      });
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    submitError.value = err.response?.data?.message || t('common.error');
  }
}
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

.accept-invite
  padding: 24px

// State Container (Loading, Error, Success)
.state-container
  display: flex
  flex-direction: column
  align-items: center
  padding: 40px 20px
  text-align: center

.state-icon
  width: 72px
  height: 72px
  border-radius: 50%
  display: flex
  align-items: center
  justify-content: center
  font-size: 36px
  margin-bottom: 20px

  &--loading
    background: rgba($primary, 0.1)

  &--error
    background: rgba($negative, 0.1)
    color: $negative

  &--success
    background: rgba($positive, 0.1)
    color: $positive

.state-title
  margin: 0 0 8px
  font-size: 18px
  font-weight: 600

  &--error
    color: $negative

  &--success
    color: $positive

.state-text
  margin: 0 0 24px
  font-size: 14px
  color: $gray-500

// Invite Header
.invite-header
  text-align: center
  margin-bottom: 24px

  &__avatar
    width: 64px
    height: 64px
    margin: 0 auto 16px
    border-radius: $radius-md
    background: linear-gradient(135deg, $primary 0%, #0052CC 100%)
    color: white
    display: flex
    align-items: center
    justify-content: center
    font-size: 24px
    font-weight: 600
    overflow: hidden
    box-shadow: 0 4px 16px rgba($primary, 0.3)

    img
      width: 100%
      height: 100%
      object-fit: cover

  &__title
    margin: 0 0 4px
    font-size: 20px
    font-weight: 600
    color: $gray-900

  &__subtitle
    margin: 0 0 4px
    font-size: 14px
    color: $gray-500

  &__entity
    font-size: 15px
    font-weight: 600
    color: $primary

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

  &--readonly
    :deep(.q-field__control)
      background: $gray-50

.toggle-visibility
  color: $gray-400
  font-size: 18px
  margin-right: 4px

  &:hover
    color: $gray-600

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
  text-decoration: none

  &:hover:not(:disabled)
    background: #0052CC

  &:disabled
    opacity: 0.6
    cursor: not-allowed

  &--outline
    background: transparent
    color: $primary
    border: 1px solid $gray-200

    &:hover:not(:disabled)
      background: $gray-50
      border-color: $gray-300

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

// Footer Link
.footer-link
  text-align: center
  margin-top: 20px

.secondary-link
  color: $primary
  font-size: 14px
  font-weight: 500
  text-decoration: none
  transition: opacity 0.2s ease

  &:hover
    opacity: 0.8
</style>
