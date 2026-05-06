<template>
  <q-page padding>
    <!-- Back Button -->
    <q-btn flat color="grey" icon="las la-arrow-left" :label="$t('common.back')" class="q-mb-md" @click="router.back()" />

    <!-- Context Alerts -->
    <AlertBanner
      v-if="!isLoading && invoice && contextAlerts.alerts.value.length > 0"
      :alerts="contextAlerts.alerts.value"
      :dismissible="true"
      :actionable="true"
      :action-label="$t('common.viewDetails')"
      class="q-mb-md"
      @dismiss="contextAlerts.dismissAlert"
    />

    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <!-- Content — tab-panel structure leaves seam for Phase 5 History tab -->
    <template v-else-if="invoice">
      <q-tabs v-model="activeTab" align="left" dense no-caps active-color="primary" indicator-color="primary" class="q-mb-md">
        <q-tab name="detail" :label="$t('invoices.tab.detail')" icon="las la-file-invoice" />
        <q-tab name="history" :label="$t('invoices.tab.history')" icon="las la-history" />
      </q-tabs>

      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel name="detail" class="q-pa-none">
          <InvoiceHeader
            :invoice="invoice"
            :balance-due="balanceDue"
            :is-overdue="isOverdue"
            @go-to-invoice="goToInvoice"
          />

          <InvoiceItemsTable :invoice="invoice" />

          <InvoiceReceiptsList
            :receipts="invoice.receipts"
            :currency="invoice.currency"
          />

          <InvoiceActions
            :balance-due="balanceDue"
            @download-pdf="downloadPdf"
            @pay="goToPayment"
          />
        </q-tab-panel>

        <q-tab-panel name="history">
          <InvoiceHistoryTab
            :corrections="invoicesStore.corrections"
            :status-logs="invoicesStore.statusLogs"
            :activities="invoicesStore.activities"
            :activities-pagination="invoicesStore.activitiesPagination"
            :is-loading-history="invoicesStore.isLoadingHistory"
            :currency="invoice.currency"
            @go-to-invoice="goToInvoice"
            @load-more-activities="loadMoreActivities"
          />
        </q-tab-panel>
      </q-tab-panels>
    </template>

    <!-- Not Found -->
    <q-card v-else flat bordered>
      <q-card-section class="text-center text-grey q-pa-xl">
        <q-icon name="las la-exclamation-circle" size="64px" class="q-mb-md" />
        <div class="text-h6">{{ $t('invoices.notFound') }}</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEntityStore } from 'src/stores/entity';
import { useInvoicesStore } from 'src/stores/invoices';
import { invoiceService } from 'src/services/invoice.service';
import { useContextAlerts } from 'src/composables/useContextAlerts';
import AlertBanner from 'src/components/AlertBanner.vue';
import InvoiceHeader from './components/InvoiceHeader.vue';
import InvoiceItemsTable from './components/InvoiceItemsTable.vue';
import InvoiceReceiptsList from './components/InvoiceReceiptsList.vue';
import InvoiceActions from './components/InvoiceActions.vue';
import InvoiceHistoryTab from 'src/components/invoices/InvoiceHistoryTab.vue';
import type { Invoice } from 'src/types';

const route = useRoute();
const router = useRouter();
const entityStore = useEntityStore();
const invoicesStore = useInvoicesStore();

const contextAlerts = useContextAlerts({
  resourceType: 'invoices',
  resourceId: () => route.params.id as string,
  unreadOnly: true,
  autoLoad: false,
});

const isLoading = ref(true);
const invoice = ref<Invoice | null>(null);
const activeTab = ref('detail');

const balanceDue = computed(() => {
  if (!invoice.value) return 0;
  if (invoice.value.remaining_amount !== undefined) {
    return Math.max(0, Number(invoice.value.remaining_amount) || 0);
  }
  const totalPayable = Number(invoice.value.total_payable) || 0;
  const paidAmount = invoice.value.receipts
    ?.filter((r) => r.is_completed)
    .reduce((sum, r) => sum + Number(r.amount), 0) ?? 0;
  return Math.max(0, totalPayable - paidAmount);
});

const isOverdue = computed(() =>
  !!invoice.value && (
    invoice.value.status === 'overdue' ||
    (balanceDue.value > 0 && new Date(invoice.value.due_date) < new Date())
  )
);

async function loadInvoice(): Promise<void> {
  if (!entityStore.selectedEntityId) return;
  const invoiceId = route.params.id as string;
  if (!invoiceId) return;

  isLoading.value = true;
  try {
    invoice.value = await invoiceService.getInvoice(entityStore.selectedEntityId, invoiceId);
    await contextAlerts.loadAlerts();
  } catch (error) {
    console.error('Failed to load invoice:', error);
    invoice.value = null;
  } finally {
    isLoading.value = false;
  }
}

// Load history when History tab is first activated
watch(activeTab, (tab) => {
  if (tab === 'history' && entityStore.selectedEntityId && invoice.value) {
    void invoicesStore.fetchInvoiceHistory(entityStore.selectedEntityId, invoice.value.id);
  }
});

async function loadMoreActivities(): Promise<void> {
  if (!entityStore.selectedEntityId || !invoice.value) return;
  await invoicesStore.fetchMoreActivities(entityStore.selectedEntityId, invoice.value.id);
}

function goToInvoice(id: string): void {
  void router.push(`/invoices/${id}`);
}

async function downloadPdf(): Promise<void> {
  if (!entityStore.selectedEntityId || !invoice.value) return;
  try {
    const blob = await invoiceService.downloadPdf(entityStore.selectedEntityId, invoice.value.id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `factura-${invoice.value.number}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download PDF:', error);
  }
}

function goToPayment(): void {
  if (!invoice.value) return;
  void router.push(`/invoices/${invoice.value.id}/pay`);
}

onMounted(() => { void loadInvoice(); });

onUnmounted(() => { invoicesStore.clearInvoiceHistory(); });
</script>
