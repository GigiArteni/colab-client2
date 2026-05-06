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
  InvoiceFilters,
  InvoiceCorrection,
  InvoiceStatusLog,
  InvoiceActivity,
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
    unpaidInvoices.value.reduce((sum, inv) => sum + Number(inv.total_payable ?? 0), 0)
  );

  const hasMore = computed(() => {
    if (!pagination.value) return false;
    return pagination.value.current_page < pagination.value.last_page;
  });

  // Actions
  async function fetchInvoices(
    entityId: string,
    params?: InvoiceFilters,
    append = false
  ): Promise<void> {
    if (append) {
      isLoadingMore.value = true;
    } else {
      isLoading.value = true;
    }
    error.value = null;

    try {
      const queryParams: InvoiceFilters = {
        ...params,
      };

      if (statusFilter.value) {
        queryParams.status = statusFilter.value;
      }

      const response = await invoiceService.getInvoices(entityId, queryParams);

      if (append && response.data) {
        invoices.value = [...invoices.value, ...response.data];
      } else {
        invoices.value = response.data || [];
      }

      if (response.meta) {
        pagination.value = response.meta;
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
    entityId: string,
    invoiceId: string
  ): Promise<Invoice> {
    isLoading.value = true;
    error.value = null;

    try {
      const invoice = await invoiceService.getInvoice(entityId, invoiceId);
      currentInvoice.value = invoice;
      return invoice;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Eroare la încărcarea facturii';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchSummary(entityId: string): Promise<InvoiceSummary | null> {
    try {
      // invoiceService does not expose a summary endpoint; use status counts as fallback
      const counts = await invoiceService.getStatusCounts(entityId);
      const fallback: InvoiceSummary = {
        total: counts.total ?? 0,
        unpaid: (counts.draft ?? 0) + (counts.sent ?? 0) + (counts.overdue ?? 0),
        overdue: counts.overdue ?? 0,
        paid: counts.paid ?? 0,
        total_balance_due: 0,
      };
      summary.value = fallback;
      return fallback;
    } catch (err) {
      console.error('Failed to fetch invoice summary:', err);
      return null;
    }
  }

  async function loadMore(entityId: string): Promise<void> {
    if (!hasMore.value || isLoadingMore.value) return;

    const nextPage = (pagination.value?.current_page || 0) + 1;
    await fetchInvoices(entityId, { page: nextPage }, true);
  }

  async function downloadPdf(
    entityId: string,
    invoiceId: string,
    invoiceNumber: string
  ): Promise<void> {
    try {
      const blob = await invoiceService.downloadPdf(entityId, invoiceId);

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

  // Invoice history state
  const corrections = ref<InvoiceCorrection[]>([]);
  const statusLogs = ref<InvoiceStatusLog[]>([]);
  const activities = ref<InvoiceActivity[]>([]);
  const activitiesPagination = ref<{ page: number; lastPage: number; total: number }>({
    page: 1,
    lastPage: 1,
    total: 0,
  });
  const isLoadingHistory = ref(false);

  async function fetchInvoiceHistory(entityId: string, invoiceId: string): Promise<void> {
    isLoadingHistory.value = true;
    try {
      const [corrs, logs, acts] = await Promise.all([
        invoiceService.getCorrections(entityId, invoiceId),
        invoiceService.getStatusLogs(entityId, invoiceId),
        invoiceService.getActivities(entityId, invoiceId, { per_page: 20 }),
      ]);
      corrections.value = corrs;
      statusLogs.value = logs;
      activities.value = acts.data;
      activitiesPagination.value = {
        page: acts.meta.current_page,
        lastPage: acts.meta.last_page,
        total: acts.meta.total,
      };
    } finally {
      isLoadingHistory.value = false;
    }
  }

  async function fetchMoreActivities(entityId: string, invoiceId: string): Promise<void> {
    const nextPage = activitiesPagination.value.page + 1;
    if (nextPage > activitiesPagination.value.lastPage) return;

    const response = await invoiceService.getActivities(entityId, invoiceId, {
      page: nextPage,
      per_page: 20,
    });
    activities.value = [...activities.value, ...response.data];
    activitiesPagination.value = {
      page: response.meta.current_page,
      lastPage: response.meta.last_page,
      total: response.meta.total,
    };
  }

  function clearInvoiceHistory(): void {
    corrections.value = [];
    statusLogs.value = [];
    activities.value = [];
    activitiesPagination.value = { page: 1, lastPage: 1, total: 0 };
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

    // Invoice history
    corrections,
    statusLogs,
    activities,
    activitiesPagination,
    isLoadingHistory,
    fetchInvoiceHistory,
    fetchMoreActivities,
    clearInvoiceHistory,
  };
});
