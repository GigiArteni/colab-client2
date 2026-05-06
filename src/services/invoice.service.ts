/**
 * Invoice Service
 * Customer invoices and receipts
 */

import { api } from 'src/boot/axios';
import type {
  Invoice,
  InvoiceItem,
  Receipt,
  InvoiceStatusCounts,
  InvoiceStatistics,
  InvoiceFilters,
  InvoiceCorrection,
  InvoiceStatusLog,
  InvoiceActivity,
  PaginatedResponse,
  PaginationMeta,
} from 'src/types';

export interface InvoiceListResponse {
  data: Invoice[];
  meta: PaginationMeta;
}

export const invoiceService = {
  /**
   * Get invoices for an entity (customer-filtered)
   */
  async getInvoices(entityId: string, filters?: InvoiceFilters): Promise<InvoiceListResponse> {
    const params: Record<string, unknown> = {};

    if (filters?.status) {
      params['filter[status]'] = Array.isArray(filters.status)
        ? filters.status.join(',')
        : filters.status;
    }
    if (filters?.group) {
      params['filter[group]'] = filters.group;
    }
    if (filters?.date_preset) {
      params['date_preset'] = filters.date_preset;
    }
    if (filters?.date_from) {
      params['filter[invoice_at]'] = `>=${filters.date_from}`;
    }
    if (filters?.date_to) {
      params['filter[invoice_at]'] = `<=${filters.date_to}`;
    }

    // Include items, receipts, subscription, and subsidies by default
    params['include'] = 'items,receipts,subscription,subsidies';

    const response = await api.get<PaginatedResponse<Invoice>>(
      `/entities/${entityId}/invoices`,
      { params }
    );
    return response.data;
  },

  /**
   * Get single invoice with details
   */
  async getInvoice(entityId: string, invoiceId: string): Promise<Invoice> {
    const response = await api.get<{ data: Invoice }>(
      `/entities/${entityId}/invoices/${invoiceId}`,
      { params: { include: 'items,receipts,subscription,subsidies' } }
    );
    return response.data.data;
  },

  /**
   * Get invoice items
   */
  async getInvoiceItems(entityId: string, invoiceId: string): Promise<InvoiceItem[]> {
    const response = await api.get<PaginatedResponse<InvoiceItem>>(
      `/entities/${entityId}/invoices/${invoiceId}/items`
    );
    return response.data.data;
  },

  /**
   * Get invoice receipts (payments)
   */
  async getInvoiceReceipts(entityId: string, invoiceId: string): Promise<Receipt[]> {
    const response = await api.get<PaginatedResponse<Receipt>>(
      `/entities/${entityId}/invoices/${invoiceId}/receipts`
    );
    return response.data.data;
  },

  /**
   * Get invoice status counts
   */
  async getStatusCounts(entityId: string): Promise<InvoiceStatusCounts> {
    const response = await api.get<{ data: InvoiceStatusCounts }>(
      `/entities/${entityId}/invoices/status-counts`
    );
    return response.data.data;
  },

  /**
   * Get invoice statistics (totals)
   */
  async getStatistics(entityId: string): Promise<InvoiceStatistics> {
    const response = await api.get<{ data: InvoiceStatistics }>(
      `/entities/${entityId}/invoices/statistics`
    );
    return response.data.data;
  },

  /**
   * Get corrections (credit notes) for an invoice
   */
  async getCorrections(entityId: string, invoiceId: string): Promise<InvoiceCorrection[]> {
    const response = await api.get<PaginatedResponse<InvoiceCorrection>>(
      `/entities/${entityId}/invoices/${invoiceId}/corrections`
    );
    return response.data.data;
  },

  /**
   * Get status change log for an invoice
   */
  async getStatusLogs(entityId: string, invoiceId: string): Promise<InvoiceStatusLog[]> {
    const response = await api.get<PaginatedResponse<InvoiceStatusLog>>(
      `/entities/${entityId}/invoices/${invoiceId}/status-logs`
    );
    return response.data.data;
  },

  /**
   * Get activity feed (comments + changes) for an invoice
   */
  async getActivities(
    entityId: string,
    invoiceId: string,
    params?: { page?: number; per_page?: number }
  ): Promise<PaginatedResponse<InvoiceActivity>> {
    const queryParams: Record<string, unknown> = { include: 'causer' };
    if (params?.page) queryParams['page'] = params.page;
    if (params?.per_page) queryParams['per_page'] = params.per_page;

    const response = await api.get<PaginatedResponse<InvoiceActivity>>(
      `/entities/${entityId}/invoices/${invoiceId}/activities`,
      { params: queryParams }
    );
    return response.data;
  },

  /**
   * Download invoice PDF
   */
  async downloadPdf(entityId: string, invoiceId: string): Promise<Blob> {
    const response = await api.get(
      `/entities/${entityId}/invoices/${invoiceId}`,
      {
        params: { export: 'pdf' },
        responseType: 'blob'
      }
    );
    return response.data as Blob;
  },
};
