<template>
  <q-page class="payment-cancel-page">
    <div class="cancel-container">
      <!-- Cancel Icon -->
      <div class="cancel-icon">
        <q-icon name="las la-times-circle" color="warning" size="80px" />
      </div>

      <!-- Title -->
      <h1 class="cancel-title">{{ $t('payments.cancel.title') }}</h1>
      <p class="cancel-message">{{ $t('payments.cancel.message') }}</p>

      <!-- Actions -->
      <div class="actions">
        <q-btn
          v-if="invoiceId"
          :to="`/invoices/${invoiceId}`"
          color="primary"
          :label="$t('payments.cancel.tryAgain')"
          unelevated
          class="action-btn"
        />
        <q-btn
          to="/invoices"
          color="grey-7"
          :label="$t('payments.cancel.backToInvoices')"
          flat
          class="action-btn"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const invoiceId = ref<string | null>(null);

onMounted(() => {
  invoiceId.value = route.query.invoice as string || null;
});
</script>

<style lang="sass" scoped>
$warning: #F59E0B

$gray-50: #F8FAFC
$gray-500: #64748B
$gray-900: #0F172A

.payment-cancel-page
  background: $gray-50
  min-height: 100vh
  display: flex
  align-items: center
  justify-content: center
  padding: 24px

.cancel-container
  max-width: 400px
  width: 100%
  text-align: center

.cancel-icon
  margin-bottom: 24px

.cancel-title
  margin: 0 0 8px
  font-size: 24px
  font-weight: 700
  color: $gray-900

.cancel-message
  margin: 0 0 32px
  font-size: 16px
  color: $gray-500

.actions
  display: flex
  flex-direction: column
  gap: 12px

.action-btn
  width: 100%
</style>
