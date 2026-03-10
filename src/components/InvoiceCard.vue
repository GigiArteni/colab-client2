<template>
  <q-card
    class="invoice-card cursor-pointer"
    :class="{ 'invoice-card--paid': invoice.status === 'paid' }"
    @click="$emit('click')"
  >
    <q-card-section>
      <div class="row items-center q-gutter-sm">
        <q-icon
          :name="getUtilityIcon(invoice.group)"
          :color="getUtilityColor(invoice.group)"
          size="32px"
        />
        <div class="col">
          <div class="text-subtitle1">{{ $t('invoices.invoice') }} #{{ invoice.number }}</div>
          <div class="text-caption text-grey">
            {{ $t('invoices.dueDate') }}: {{ formatDate(invoice.due_date) }}
          </div>
          <div v-if="props.invoice.is_overdue" class="text-caption text-negative text-weight-bold">
            {{ $t('invoices.overdueWarning') }}
          </div>
          <div v-if="isPenalty && props.invoice.penalty_info" class="text-caption text-deep-orange">
            {{ $t('invoices.penaltyFor', { number: props.invoice.penalty_info.source_invoice_number }) }}
          </div>
        </div>
        <div class="text-right">
          <div class="text-h6" :class="getAmountClass">
            {{ formatCurrency(Number(invoice.total_payable)) }}
          </div>
          <q-chip
            dense
            :color="getStatusColor(invoice.status)"
            text-color="white"
            :label="$t(`invoices.status.${invoice.status}`)"
            size="sm"
          />
          <q-chip
            v-if="isPenalty"
            dense
            color="deep-orange"
            text-color="white"
            icon="las la-percentage"
            :label="$t('invoices.penaltyInvoice')"
            size="sm"
            class="q-ml-xs"
          />
        </div>
      </div>
    </q-card-section>

    <q-card-actions v-if="canBePaid">
      <q-btn flat color="primary" :label="$t('common.viewDetails')" />
      <q-space />
      <q-btn color="primary" :label="$t('invoices.pay')" @click.stop="$emit('pay')" />
    </q-card-actions>
    <q-card-actions v-else>
      <q-btn flat color="grey" :label="$t('common.viewDetails')" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Invoice } from 'src/types';

const props = defineProps<{
  invoice: Invoice;
}>();

defineEmits<{
  click: [];
  pay: [];
}>();

const isPenalty = computed(() => props.invoice.type === 'late-payment-penalty');

const getAmountClass = computed(() => {
  if (props.invoice.status === 'paid') return 'text-positive';
  if (props.invoice.status === 'overdue') return 'text-negative';
  return 'text-primary';
});

const canBePaid = computed(() => {
  // Check status first - paid/cancelled/refunded cannot be paid
  if (['paid', 'cancelled', 'refunded', 'corrected', 'draft'].includes(props.invoice.status)) {
    return false;
  }
  const totalPayable = Number(props.invoice.total_payable) || 0;
  // Calculate completed payments
  const paidAmount = props.invoice.receipts
    ?.filter(r => r.is_completed)
    .reduce((sum, r) => sum + Number(r.amount), 0) || 0;
  // Calculate pending payments (already in progress)
  const pendingAmount = props.invoice.receipts
    ?.filter(r => r.is_pending)
    .reduce((sum, r) => sum + Number(r.amount), 0) || 0;
  // Hide Pay if fully paid OR has pending payment covering remainder
  const remainingAfterPaid = totalPayable - paidAmount;
  return remainingAfterPaid > 0 && pendingAmount < remainingAfterPaid;
});

function getUtilityIcon(type?: string): string {
  const icons: Record<string, string> = {
    'electricity': 'las la-bolt',
    'natural-gas': 'las la-fire',
    'water': 'las la-tint',
    'sewage': 'las la-water',
  };
  return icons[type || ''] || 'las la-file-invoice';
}

function getUtilityColor(type?: string): string {
  const colors: Record<string, string> = {
    'electricity': 'amber',
    'natural-gas': 'orange',
    'water': 'blue',
    'sewage': 'teal',
  };
  return colors[type || ''] || 'grey';
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'grey',
    pending: 'warning',
    validated: 'warning',
    sent: 'primary',
    partially_paid: 'info',
    paid: 'positive',
    overdue: 'negative',
    cancelled: 'grey',
    refunded: 'purple',
  };
  return colors[status] || 'grey';
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: props.invoice.currency || 'RON',
  }).format(amount);
}
</script>

<style lang="sass" scoped>
.invoice-card
  transition: transform 0.2s, box-shadow 0.2s

  &:hover
    transform: translateY(-2px)
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)

  &--paid
    opacity: 0.85
    background: $grey-1
</style>
