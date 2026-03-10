/**
 * Invoices Store - Manages invoice state
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { invoiceService } from 'src/services/invoice.service';
import type {
  Invoice,
  InvoiceStatus,
  InvoiceSummary,
  InvoiceListParams,
  PaginationMeta,
} from 'src/types';

export const useInvoicesStore = defineStore('invoices', () => {
  // State
  const invoices = ref<Invoice[]>([]);
  const currentInvoice = ref<Invoice | null>(null);
  const summary = ref<InvoiceSummary | null>(null);
  const pagination = ref<PaginationMeta | null>(null);
  const isLoading = ref(false);
  const isLoadingMore = ref(false);
  const error = ref<string | null>(null);

  // Filters
  const statusFilter = ref<InvoiceStatus | null>(null);
  const sortBy = ref<string>('-issue_date');

  // Computed
  const unpaidInvoices = computed(() =>
    invoices.value.filter((inv) => inv.status !== 'paid' && inv.status !== 'cancelled')
  );

  const overdueInvoices = computed(() =>
    invoices.value.filter((inv) => inv.status === 'overdue')
  );

  const totalUnpaid = computed(() =>
    unpaidInvoices.value.reduce((sum, inv) => sum + inv.balance_due, 0)
  );

  const hasMore = computed(() => {
    if (!pagination.value) return false;
    return pagination.value.current_page < pagination.value.last_page;
  });

  // Actions
  async function fetchInvoices(
    entityId: number,
    params?: InvoiceListParams,
    append = false
  ): Promise<void> {
    if (append) {
      isLoadingMore.value = true;
    } else {
      isLoading.value = true;
    }
    error.value = null;

    try {
      const queryParams: InvoiceListParams = {
        sort: sortBy.value,
        ...params,
      };

      if (statusFilter.value) {
        queryParams['filter[status]'] = statusFilter.value;
      }

      const response = await invoiceService.getInvoices(entityId, queryParams);

      if (append && response.data) {
        invoices.value = [...invoices.value, ...response.data];
      } else {
        invoices.value = response.data || [];
      }

      if (response.meta?.pagination) {
        pagination.value = response.meta.pagination;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Eroare la încărcarea facturilor';
      throw err;
    } finally {
      isLoading.value = false;
      isLoadingMore.value = false;
    }
  }

  async function fetchInvoice(
    entityId: number,
    subscriptionId: number,
    invoiceId: number
  ): Promise<Invoice> {
    isLoading.value = true;
    error.value = null;

    try {
      const invoice = await invoiceService.getInvoice(
        entityId,
        subscriptionId,
        invoiceId
      );
      currentInvoice.value = invoice;
      return invoice;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Eroare la încărcarea facturii';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchSummary(entityId: number): Promise<InvoiceSummary> {
    try {
      const summaryData = await invoiceService.getInvoiceSummary(entityId);
      summary.value = summaryData;
      return summaryData;
    } catch (err) {
      console.error('Failed to fetch invoice summary:', err);
      throw err;
    }
  }

  async function loadMore(entityId: number): Promise<void> {
    if (!hasMore.value || isLoadingMore.value) return;

    const nextPage = (pagination.value?.current_page || 0) + 1;
    await fetchInvoices(entityId, { page: nextPage }, true);
  }

  async function downloadPdf(
    entityId: number,
    subscriptionId: number,
    invoiceId: number,
    invoiceNumber: string
  ): Promise<void> {
    try {
      const blob = await invoiceService.downloadPdf(entityId, subscriptionId, invoiceId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      error.value = 'Eroare la descărcarea PDF-ului';
      throw err;
    }
  }

  function setStatusFilter(status: InvoiceStatus | null): void {
    statusFilter.value = status;
  }

  function setSortBy(sort: string): void {
    sortBy.value = sort;
  }

  function clearCurrentInvoice(): void {
    currentInvoice.value = null;
  }

  function reset(): void {
    invoices.value = [];
    currentInvoice.value = null;
    summary.value = null;
    pagination.value = null;
    error.value = null;
    statusFilter.value = null;
  }

  return {
    // State
    invoices,
    currentInvoice,
    summary,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    statusFilter,
    sortBy,

    // Computed
    unpaidInvoices,
    overdueInvoices,
    totalUnpaid,
    hasMore,

    // Actions
    fetchInvoices,
    fetchInvoice,
    fetchSummary,
    loadMore,
    downloadPdf,
    setStatusFilter,
    setSortBy,
    clearCurrentInvoice,
    reset,
  };
});
