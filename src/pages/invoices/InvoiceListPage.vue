<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">{{ $t('invoices.title') }}</div>

    <!-- Filters -->
    <q-card class="q-mb-md" flat bordered>
      <q-card-section class="q-pa-sm">
        <div class="row q-gutter-sm items-center">
          <q-btn-toggle
            v-model="statusFilter"
            toggle-color="primary"
            :options="statusOptions"
            rounded
            unelevated
          />
          <q-space />
          <q-select
            v-model="utilityFilter"
            :options="utilityOptions"
            :label="$t('invoices.utilityType')"
            dense
            outlined
            emit-value
            map-options
            clearable
            style="min-width: 150px"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <!-- Invoice List -->
    <template v-else>
      <!-- Unpaid Invoices -->
      <template v-if="unpaidInvoices.length > 0">
        <div class="text-subtitle1 text-weight-medium q-mb-sm text-negative">
          {{ $t('invoices.unpaid') }} ({{ unpaidInvoices.length }})
        </div>
        <div class="row q-col-gutter-md q-mb-lg">
          <div
            v-for="invoice in unpaidInvoices"
            :key="invoice.id"
            class="col-12 col-md-6"
          >
            <InvoiceCard :invoice="invoice" @click="goToInvoice(invoice.id)" @pay="goToPayment(invoice.id)" />
          </div>
        </div>
      </template>

      <!-- Paid Invoices -->
      <template v-if="paidInvoices.length > 0">
        <div class="text-subtitle1 text-weight-medium q-mb-sm text-positive">
          {{ $t('invoices.paid') }} ({{ paidInvoices.length }})
        </div>
        <div class="row q-col-gutter-md">
          <div
            v-for="invoice in paidInvoices"
            :key="invoice.id"
            class="col-12 col-md-6"
          >
            <InvoiceCard :invoice="invoice" @click="goToInvoice(invoice.id)" @pay="goToPayment(invoice.id)" />
          </div>
        </div>
      </template>

      <!-- No Results -->
      <q-card v-if="filteredInvoices.length === 0" flat bordered>
        <q-card-section class="text-center text-grey q-pa-xl">
          <q-icon name="las la-file-invoice" size="64px" class="q-mb-md" />
          <div class="text-h6">{{ $t('invoices.noInvoices') }}</div>
          <div class="text-body2">{{ $t('invoices.noInvoicesHint') }}</div>
        </q-card-section>
      </q-card>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useEntityStore } from 'src/stores/entity';
import { invoiceService } from 'src/services/invoice.service';
import InvoiceCard from 'src/components/InvoiceCard.vue';
import type { Invoice, InvoiceStatus, UtilityGroup } from 'src/types';

const { t } = useI18n();
const router = useRouter();
const entityStore = useEntityStore();

const isLoading = ref(true);
const invoices = ref<Invoice[]>([]);
const statusFilter = ref<InvoiceStatus | 'all'>('all');
const utilityFilter = ref<UtilityGroup | null>(null);

const statusOptions = computed(() => [
  { label: t('invoices.all'), value: 'all' },
  { label: t('invoices.sent'), value: 'sent' },
  { label: t('invoices.overdue'), value: 'overdue' },
  { label: t('invoices.partiallyPaid'), value: 'partially_paid' },
  { label: t('invoices.paid'), value: 'paid' },
]);

const utilityOptions = computed(() => [
  { label: t('utilities.electricity'), value: 'electricity' },
  { label: t('utilities.natural-gas'), value: 'natural-gas' },
  { label: t('utilities.water'), value: 'water' },
  { label: t('utilities.sewage'), value: 'sewage' },
]);

const filteredInvoices = computed(() => {
  let result = [...invoices.value];

  if (statusFilter.value !== 'all') {
    result = result.filter(i => i.status === statusFilter.value);
  }

  if (utilityFilter.value) {
    result = result.filter(i => i.group === utilityFilter.value);
  }

  // Sort by most recent first
  result.sort((a, b) => new Date(b.invoice_at).getTime() - new Date(a.invoice_at).getTime());

  return result;
});

const unpaidInvoices = computed(() =>
  filteredInvoices.value.filter(i => ['pending', 'validated', 'sent', 'overdue', 'partially_paid'].includes(i.status))
);

const paidInvoices = computed(() =>
  filteredInvoices.value.filter(i => i.status === 'paid')
);

async function loadInvoices(): Promise<void> {
  if (!entityStore.selectedEntityId) return;

  isLoading.value = true;

  try {
    const response = await invoiceService.getInvoices(entityStore.selectedEntityId);
    invoices.value = response.data;
  } catch (error) {
    console.error('Failed to load invoices:', error);
  } finally {
    isLoading.value = false;
  }
}

function goToInvoice(id: string): void {
  void router.push(`/invoices/${id}`);
}

function goToPayment(id: string): void {
  void router.push(`/invoices/${id}/pay`);
}

watch(() => entityStore.selectedEntityId, () => {
  if (entityStore.selectedEntityId) {
    void loadInvoices();
  }
}, { immediate: true });
</script>
