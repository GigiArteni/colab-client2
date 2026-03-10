<template>
  <q-page padding class="flex flex-center">
    <div class="text-center">
      <q-icon name="las la-check-circle" size="100px" color="positive" />
      <div class="text-h4 q-mt-md">{{ $t('payment.successTitle') }}</div>
      <div class="text-body1 text-grey q-mt-sm q-mb-lg">
        {{ $t('payment.successMessage') }}
      </div>
      <div class="q-gutter-sm">
        <q-btn color="primary" :label="$t('payment.viewInvoices')" to="/invoices" />
        <q-btn outline color="primary" :label="$t('nav.dashboard')" to="/dashboard" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
//
</script>
