<template>
  <q-page class="support-page">
    <!-- Header -->
    <header class="support-header">
      <h1 class="support-header__title">{{ $t('support.title') }}</h1>
      <p class="support-header__subtitle">{{ $t('support.subtitle') }}</p>
    </header>

    <div class="support-content">
      <!-- Contact Options -->
      <section class="support-section">
        <h2 class="section-title">{{ $t('support.contactUs') }}</h2>
        <div class="contact-card">
          <div class="contact-item" @click="callPhone">
            <div class="contact-item__icon contact-item__icon--primary">
              <q-icon name="las la-phone" />
            </div>
            <div class="contact-item__content">
              <span class="contact-item__title">{{ $t('support.phone') }}</span>
              <span class="contact-item__value">{{ supportPhone }}</span>
            </div>
            <q-icon name="las la-angle-right" class="contact-item__arrow" />
          </div>

          <div class="contact-item" @click="sendEmail">
            <div class="contact-item__icon contact-item__icon--info">
              <q-icon name="las la-envelope" />
            </div>
            <div class="contact-item__content">
              <span class="contact-item__title">{{ $t('support.email') }}</span>
              <span class="contact-item__value">{{ supportEmail }}</span>
            </div>
            <q-icon name="las la-angle-right" class="contact-item__arrow" />
          </div>

          <div class="contact-item" @click="openWhatsApp">
            <div class="contact-item__icon contact-item__icon--success">
              <q-icon name="lab la-whatsapp" />
            </div>
            <div class="contact-item__content">
              <span class="contact-item__title">WhatsApp</span>
              <span class="contact-item__value">{{ $t('support.whatsappHint') }}</span>
            </div>
            <q-icon name="las la-angle-right" class="contact-item__arrow" />
          </div>
        </div>
      </section>

      <!-- Working Hours -->
      <section class="support-section">
        <h2 class="section-title">{{ $t('support.workingHours') }}</h2>
        <div class="hours-card">
          <div class="hours-row">
            <span class="hours-row__day">{{ $t('support.weekdays') }}</span>
            <span class="hours-row__time">08:00 - 17:00</span>
          </div>
          <div class="hours-row">
            <span class="hours-row__day">{{ $t('support.saturday') }}</span>
            <span class="hours-row__time">09:00 - 13:00</span>
          </div>
          <div class="hours-row">
            <span class="hours-row__day">{{ $t('support.sunday') }}</span>
            <span class="hours-row__time hours-row__time--closed">{{ $t('support.closed') }}</span>
          </div>
        </div>
      </section>

      <!-- Emergency Banner -->
      <section class="support-section">
        <div class="emergency-banner" @click="callEmergency">
          <div class="emergency-banner__icon">
            <q-icon name="las la-exclamation-triangle" />
          </div>
          <div class="emergency-banner__content">
            <span class="emergency-banner__title">{{ $t('support.emergency') }}</span>
            <span class="emergency-banner__hint">{{ $t('support.emergencyHint') }}</span>
          </div>
          <span class="emergency-banner__phone">{{ emergencyPhone }}</span>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="support-section">
        <h2 class="section-title">{{ $t('support.faq') }}</h2>
        <div class="faq-card">
          <q-expansion-item
            v-for="(faq, index) in faqs"
            :key="index"
            :label="faq.question"
            header-class="faq-question"
            expand-separator
          >
            <div class="faq-answer">{{ faq.answer }}</div>
          </q-expansion-item>
        </div>
      </section>

      <!-- Send Message Form -->
      <section class="support-section">
        <h2 class="section-title">{{ $t('support.sendMessage') }}</h2>
        <div class="message-card">
          <q-form @submit.prevent="handleSendMessage" class="form">
            <div class="form-group">
              <label class="form-label">{{ $t('support.subject') }}</label>
              <q-select
                v-model="messageForm.subject"
                :options="subjectOptions"
                outlined
                dense
                emit-value
                map-options
                :rules="[(v) => !!v || $t('validation.required')]"
              />
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('support.messageLabel') }}</label>
              <q-input
                v-model="messageForm.message"
                type="textarea"
                outlined
                dense
                rows="4"
                :rules="[(v) => !!v || $t('validation.required')]"
              />
            </div>

            <button type="submit" class="submit-btn" :disabled="isSending">
              <q-spinner-dots v-if="isSending" color="white" size="20px" />
              <template v-else>
                <q-icon name="las la-paper-plane" />
                {{ $t('support.send') }}
              </template>
            </button>
          </q-form>
        </div>
      </section>
    </div>

    <!-- Bottom Spacer -->
    <div class="page-spacer"></div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { profileService } from 'src/services/profile.service';

const $q = useQuasar();
const { t } = useI18n();

const supportPhone = '0800 123 456';
const supportEmail = 'suport@utilitate.ro';
const emergencyPhone = '0800 800 800';
const whatsAppNumber = '40721123456';

const isSending = ref(false);
const messageForm = reactive({ subject: null as string | null, message: '' });

const subjectOptions = computed(() => [
  { label: t('support.subjects.invoice'), value: 'invoice' },
  { label: t('support.subjects.reading'), value: 'reading' },
  { label: t('support.subjects.contract'), value: 'contract' },
  { label: t('support.subjects.payment'), value: 'payment' },
  { label: t('support.subjects.technical'), value: 'technical' },
  { label: t('support.subjects.other'), value: 'other' },
]);

const faqs = computed(() => [
  { question: t('support.faqs.howToPayQuestion'), answer: t('support.faqs.howToPayAnswer') },
  { question: t('support.faqs.readingQuestion'), answer: t('support.faqs.readingAnswer') },
  { question: t('support.faqs.invoiceQuestion'), answer: t('support.faqs.invoiceAnswer') },
  { question: t('support.faqs.contractQuestion'), answer: t('support.faqs.contractAnswer') },
]);

function callPhone(): void { window.location.href = `tel:${supportPhone.replace(/\s/g, '')}`; }
function sendEmail(): void { window.location.href = `mailto:${supportEmail}`; }
function openWhatsApp(): void { window.open(`https://wa.me/${whatsAppNumber}`, '_blank'); }
function callEmergency(): void { window.location.href = `tel:${emergencyPhone.replace(/\s/g, '')}`; }

async function handleSendMessage(): Promise<void> {
  if (!messageForm.subject || !messageForm.message) return;
  isSending.value = true;
  try {
    await profileService.sendContactMessage({ subject: messageForm.subject, message: messageForm.message });
    $q.notify({ type: 'positive', message: t('support.messageSent'), position: 'bottom' });
    messageForm.subject = null;
    messageForm.message = '';
  } catch { $q.notify({ type: 'negative', message: t('common.error'), position: 'bottom' }); } finally { isSending.value = false; }
}
</script>

<style lang="sass" scoped>
$primary: #0066FF
$positive: #10B981
$negative: #EF4444
$warning: #F59E0B
$info: #3B82F6

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

.support-page
  background: $gray-50
  min-height: 100vh

.support-header
  background: linear-gradient(135deg, $primary 0%, #0052CC 100%)
  padding: 24px 20px
  color: white

  &__title
    margin: 0 0 4px
    font-size: 22px
    font-weight: 600

  &__subtitle
    margin: 0
    font-size: 14px
    opacity: 0.8

.support-content
  padding: 20px

.support-section
  margin-bottom: 24px

.section-title
  margin: 0 0 12px
  font-size: 16px
  font-weight: 600
  color: $gray-800

.contact-card
  background: white
  border-radius: $radius-lg
  border: 1px solid $gray-100
  overflow: hidden

.contact-item
  display: flex
  align-items: center
  gap: 14px
  padding: 16px
  border-bottom: 1px solid $gray-100
  cursor: pointer
  transition: background 0.2s ease

  &:last-child
    border-bottom: none

  &:hover
    background: $gray-50

  &__icon
    width: 44px
    height: 44px
    border-radius: $radius-md
    display: flex
    align-items: center
    justify-content: center
    font-size: 20px

    &--primary
      background: rgba($primary, 0.1)
      color: $primary

    &--info
      background: rgba($info, 0.1)
      color: $info

    &--success
      background: rgba($positive, 0.1)
      color: $positive

  &__content
    flex: 1

  &__title
    display: block
    font-size: 14px
    font-weight: 500
    color: $gray-900

  &__value
    display: block
    font-size: 13px
    color: $gray-500
    margin-top: 2px

  &__arrow
    color: $gray-300
    font-size: 16px

.hours-card
  background: white
  border-radius: $radius-lg
  border: 1px solid $gray-100
  overflow: hidden

.hours-row
  display: flex
  justify-content: space-between
  padding: 14px 16px
  border-bottom: 1px solid $gray-100

  &:last-child
    border-bottom: none

  &__day
    font-size: 14px
    color: $gray-700

  &__time
    font-size: 14px
    font-weight: 500
    color: $gray-900

    &--closed
      color: $gray-400

.emergency-banner
  display: flex
  align-items: center
  gap: 14px
  padding: 16px
  background: rgba($warning, 0.08)
  border: 1px solid rgba($warning, 0.2)
  border-radius: $radius-lg
  cursor: pointer
  transition: all 0.2s ease

  &:hover
    background: rgba($warning, 0.12)

  &__icon
    width: 44px
    height: 44px
    border-radius: $radius-md
    background: rgba($warning, 0.15)
    color: $warning
    display: flex
    align-items: center
    justify-content: center
    font-size: 20px

  &__content
    flex: 1

  &__title
    display: block
    font-size: 14px
    font-weight: 600
    color: $gray-900

  &__hint
    display: block
    font-size: 12px
    color: $gray-600
    margin-top: 2px

  &__phone
    font-size: 14px
    font-weight: 700
    color: $warning

.faq-card
  background: white
  border-radius: $radius-lg
  border: 1px solid $gray-100
  overflow: hidden

.faq-question
  font-weight: 500
  color: $gray-900

.faq-answer
  padding: 0 16px 16px
  font-size: 14px
  color: $gray-600
  line-height: 1.6

.message-card
  background: white
  border-radius: $radius-lg
  border: 1px solid $gray-100
  padding: 20px

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

.submit-btn
  display: flex
  align-items: center
  justify-content: center
  gap: 8px
  width: 100%
  padding: 14px
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
    opacity: 0.7
    cursor: not-allowed

.page-spacer
  height: 24px

@media (min-width: 600px)
  .support-header
    max-width: 600px
    margin: 0 auto
    padding: 32px 24px

  .support-content
    max-width: 600px
    margin: 0 auto
    padding: 24px
</style>
