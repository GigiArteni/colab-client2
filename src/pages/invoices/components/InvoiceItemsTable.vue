<template>
  <q-card class="q-mb-md">
    <q-card-section>
      <div class="text-subtitle1 text-weight-medium q-mb-md">
        {{ $t('invoices.details') }}
      </div>

      <q-list separator>
        <q-item v-for="item in invoice.items" :key="item.id">
          <q-item-section>
            <q-item-label>{{ item.description || item.item_name }}</q-item-label>
            <q-item-label caption v-if="item.quantity && item.unit">
              {{ item.quantity }} {{ item.unit }} x {{ formatCurrency(Number(item.unit_price)) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label class="text-weight-medium">
              {{ formatCurrency(Number(item.amount || item.line_total || 0)) }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label class="text-weight-medium">{{ $t('invoices.subtotal') }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label class="text-weight-medium">
              {{ formatCurrency(Number(invoice.subtotal)) }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="invoice.tax_amount">
          <q-item-section>
            <q-item-label>{{ $t('invoices.tax') }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label>{{ formatCurrency(Number(invoice.tax_amount)) }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="invoice.discount_amount && Number(invoice.discount_amount) > 0">
          <q-item-section>
            <q-item-label>{{ $t('invoices.discount') }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label class="text-negative">
              -{{ formatCurrency(Number(invoice.discount_amount)) }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item class="bg-grey-2">
          <q-item-section>
            <q-item-label class="text-weight-medium">{{ $t('invoices.grandTotal') }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label class="text-weight-medium">
              {{ formatCurrency(Number(invoice.grand_total)) }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="invoice.subsidy_amount && Number(invoice.subsidy_amount) > 0">
          <q-item-section>
            <q-item-label class="text-positive">{{ $t('invoices.subsidyDeduction') }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label class="text-positive">
              -{{ formatCurrency(Number(invoice.subsidy_amount)) }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item class="bg-primary text-white">
          <q-item-section>
            <q-item-label class="text-h6">{{ $t('invoices.totalPayable') }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label class="text-h6">
              {{ formatCurrency(Number(invoice.total_payable)) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { Invoice } from 'src/types';

const props = defineProps<{
  invoice: Invoice;
}>();

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: props.invoice.currency || 'RON',
  }).format(amount);
}
</script>
