<template>
  <div>
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row items-center q-gutter-md">
          <q-icon
            :name="utilityIcon"
            :color="utilityColor"
            size="48px"
          />
          <div class="col">
            <div class="text-h5">{{ $t('invoices.invoice') }} #{{ invoice.number }}</div>
            <div class="text-caption text-grey">
              {{ invoice.subscription?.contract_no }}
            </div>
          </div>
          <q-chip
            :color="statusColor"
            text-color="white"
            :label="$t(`invoices.status.${invoice.status}`)"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-6 col-md-3">
            <div class="text-caption text-grey">{{ $t('invoices.issueDate') }}</div>
            <div class="text-body1">{{ formatDate(invoice.invoice_at) }}</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-caption text-grey">{{ $t('invoices.dueDate') }}</div>
            <div class="text-body1" :class="{ 'text-negative': isOverdue }">
              {{ formatDate(invoice.due_date) }}
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-caption text-grey">{{ $t('invoices.totalPayable') }}</div>
            <div class="text-h6 text-primary">{{ formatCurrency(Number(invoice.total_payable)) }}</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-caption text-grey">{{ $t('invoices.balanceDue') }}</div>
            <div class="text-h6" :class="balanceDue > 0 ? 'text-negative' : 'text-positive'">
              {{ formatCurrency(balanceDue) }}
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Overdue warning -->
    <q-banner v-if="invoice.is_overdue" class="bg-negative text-white q-mb-md" rounded>
      <template #avatar>
        <q-icon name="las la-exclamation-triangle" />
      </template>
      <div class="text-subtitle1">{{ $t('invoices.overdueWarning') }}</div>
      <div class="text-caption">{{ $t('invoices.dueDate') }}: {{ formatDate(invoice.due_date) }}</div>
    </q-banner>

    <!-- Penalty details -->
    <q-card v-if="isPenalty && invoice.penalty_info" class="q-mb-md">
      <q-card-section>
        <div class="row items-center q-mb-md">
          <q-icon name="las la-percentage" size="32px" color="deep-orange" class="q-mr-md" />
          <div class="col">
            <div class="text-subtitle1 text-weight-medium text-deep-orange">
              {{ $t('invoices.penaltyFor', { number: invoice.penalty_info.source_invoice_number }) }}
            </div>
            <div class="text-caption text-grey-7">
              {{ $t('invoices.penaltyDays', { days: invoice.penalty_info.days }) }}
              · {{ $t('invoices.penaltyRate', { rate: invoice.penalty_info.rate }) }}
            </div>
          </div>
        </div>

        <q-table
          v-if="invoice.penalty_info.periods?.length"
          :rows="invoice.penalty_info.periods"
          :columns="penaltyColumns"
          flat bordered dense hide-bottom
          row-key="start"
          :rows-per-page-options="[0]"
        />

        <q-btn
          flat color="primary" icon="las la-external-link-alt"
          :label="$t('invoices.viewSourceInvoice')"
          class="q-mt-md"
          @click="emit('go-to-invoice', invoice.penalty_info.source_invoice_id)"
        />
      </q-card-section>
    </q-card>

    <!-- Consumption period -->
    <q-card v-if="invoice.from_date && invoice.to_date" class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-sm">
          {{ $t('invoices.consumptionPeriod') }}
        </div>
        <div class="text-body1">
          {{ formatDate(invoice.from_date) }} - {{ formatDate(invoice.to_date) }}
        </div>
      </q-card-section>
    </q-card>

    <!-- Subsidy information -->
    <q-card
      v-if="invoice.subsidy_amount && Number(invoice.subsidy_amount) > 0"
      class="q-mb-md bg-positive-1"
    >
      <q-card-section>
        <div class="row items-center q-mb-md">
          <q-icon name="las la-hand-holding-usd" size="32px" color="positive" class="q-mr-md" />
          <div class="col">
            <div class="text-subtitle1 text-weight-medium text-positive">
              {{ $t('invoices.subsidyApplied') }}
            </div>
            <div class="text-caption text-grey-7">{{ $t('invoices.subsidyDescription') }}</div>
          </div>
          <div class="text-h6 text-positive">
            {{ formatCurrency(Number(invoice.subsidy_amount)) }}
          </div>
        </div>

        <template v-if="invoice.subsidies && invoice.subsidies.length > 0">
          <q-separator class="q-mb-md" />
          <div v-for="subsidy in invoice.subsidies" :key="subsidy.id" class="q-mb-md">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6 col-md-3">
                <div class="text-caption text-grey-7">{{ $t('invoices.subsidyType') }}</div>
                <div class="text-body2 text-weight-medium">{{ subsidy.type_label }}</div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="text-caption text-grey-7">{{ $t('invoices.calculationMode') }}</div>
                <div class="text-body2">{{ subsidy.calculation_mode_label }}</div>
              </div>
              <div v-if="subsidy.calculation_mode === 'percentage'" class="col-12 col-sm-6 col-md-3">
                <div class="text-caption text-grey-7">{{ $t('invoices.percentage') }}</div>
                <div class="text-body2">{{ subsidy.percentage }}%</div>
              </div>
              <div v-else-if="subsidy.unit_rate" class="col-12 col-sm-6 col-md-3">
                <div class="text-caption text-grey-7">{{ $t('invoices.unitRate') }}</div>
                <div class="text-body2">{{ subsidy.unit_rate }} RON/{{ subsidy.unit || 'unit' }}</div>
              </div>
              <div v-else class="col-12 col-sm-6 col-md-3">
                <div class="text-caption text-grey-7">{{ $t('invoices.subsidyAmount') }}</div>
                <div class="text-body2">{{ formatCurrency(Number(subsidy.amount)) }}</div>
              </div>
              <div v-if="subsidy.regulatory_reference" class="col-12 col-sm-6 col-md-3">
                <div class="text-caption text-grey-7">{{ $t('invoices.regulatoryReference') }}</div>
                <div class="text-body2">{{ subsidy.regulatory_reference }}</div>
              </div>
            </div>
            <div v-if="subsidy.description" class="q-mt-sm">
              <div class="text-caption text-grey-7">{{ $t('invoices.description') }}</div>
              <div class="text-body2">{{ subsidy.description }}</div>
            </div>
          </div>
        </template>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Invoice } from 'src/types';

const props = defineProps<{
  invoice: Invoice;
  balanceDue: number;
  isOverdue: boolean;
}>();

const emit = defineEmits<{
  'go-to-invoice': [id: string];
}>();

const { t } = useI18n();

const isPenalty = computed(() => props.invoice.type === 'late-payment-penalty');

const utilityIcon = computed(() => {
  const icons: Record<string, string> = {
    electricity: 'las la-bolt',
    'natural-gas': 'las la-fire',
    water: 'las la-tint',
    sewage: 'las la-water',
  };
  return icons[props.invoice.group ?? ''] ?? 'las la-file-invoice';
});

const utilityColor = computed(() => {
  const colors: Record<string, string> = {
    electricity: 'amber',
    'natural-gas': 'orange',
    water: 'blue',
    sewage: 'teal',
  };
  return colors[props.invoice.group ?? ''] ?? 'grey';
});

const statusColor = computed(() => {
  const colors: Record<string, string> = {
    pending: 'warning',
    paid: 'positive',
    overdue: 'negative',
    partial: 'info',
    cancelled: 'grey',
  };
  return colors[props.invoice.status] ?? 'grey';
});

const penaltyColumns = computed(() => [
  { name: 'start', label: t('invoices.penaltyPeriodFrom'), field: 'start', align: 'left' as const },
  { name: 'end', label: t('invoices.penaltyPeriodTo'), field: 'end', align: 'left' as const },
  { name: 'days', label: t('invoices.penaltyPeriodDays'), field: 'days', align: 'center' as const },
  { name: 'balance', label: t('invoices.penaltyPeriodBalance'), field: 'balance', align: 'right' as const,
    format: (val: number) => formatCurrency(val ?? 0) },
  { name: 'daily_amount', label: t('invoices.penaltyPeriodDaily'), field: 'daily_amount', align: 'right' as const,
    format: (val: number) => formatCurrency(val ?? 0) },
  { name: 'period_total', label: t('invoices.penaltyPeriodTotal'), field: 'period_total', align: 'right' as const,
    format: (val: number) => formatCurrency(val ?? 0) },
]);

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ro-RO', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: props.invoice.currency || 'RON',
  }).format(amount);
}
</script>
