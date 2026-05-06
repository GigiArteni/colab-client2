<template>
  <div class="row q-gutter-sm">
    <q-btn
      outline
      color="primary"
      icon="las la-file-pdf"
      :label="$t('invoices.downloadPdf')"
      @click="emit('download-pdf')"
    />
    <q-btn
      v-if="balanceDue > 0"
      color="primary"
      icon="las la-credit-card"
      :label="$t('invoices.pay')"
      @click="emit('pay')"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  balanceDue: number;
}>();

const emit = defineEmits<{
  'download-pdf': [];
  pay: [];
}>();
</script>
