<template>
  <q-card v-if="receipts && receipts.length > 0" class="q-mb-md">
    <q-card-section>
      <div class="text-subtitle1 text-weight-medium q-mb-md">
        {{ $t('invoices.paymentHistory') }}
      </div>

      <q-list separator>
        <q-item v-for="receipt in receipts" :key="receipt.id">
          <q-item-section avatar>
            <q-icon name="las la-check-circle" color="positive" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ formatCurrency(Number(receipt.amount)) }}</q-item-label>
            <q-item-label caption v-if="receipt.paid_at">
              {{ formatDate(receipt.paid_at) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side v-if="receipt.payment_method">
            <q-chip size="sm" :label="$t(`payment.method.${receipt.payment_method}`)" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
const props = defineProps<{
  receipts: Array<{
    id: string;
    amount: number | string;
    paid_at?: string;
    payment_method?: string;
    is_completed?: boolean;
  }> | undefined;
  currency?: string;
}>();

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ro-RO', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: props.currency || 'RON',
  }).format(amount);
}
</script>
