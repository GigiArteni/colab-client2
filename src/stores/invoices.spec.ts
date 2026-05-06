/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('src/boot/axios', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import { useInvoicesStore } from './invoices';
import { invoiceService } from 'src/services/invoice.service';

vi.mock('src/services/invoice.service');
const mockedService = vi.mocked(invoiceService);

const makeInvoice = (overrides = {}) => ({
  id: 'inv1',
  status: 'unpaid',
  balance_due: 100,
  ...overrides,
});

const makePaginatedResponse = (data: unknown[], page = 1, lastPage = 1) => ({
  data,
  meta: {
    pagination: { current_page: page, last_page: lastPage, total: data.length, per_page: 20 },
  },
});

describe('useInvoicesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetchInvoices populates invoices', async () => {
    const invoices = [makeInvoice()];
    mockedService.getInvoices.mockResolvedValueOnce(makePaginatedResponse(invoices) as any);

    const store = useInvoicesStore();
    await store.fetchInvoices('e1' as any);

    expect(store.invoices).toEqual(invoices);
    expect(store.isLoading).toBe(false);
  });

  it('fetchInvoices with append=true merges results', async () => {
    const inv1 = makeInvoice({ id: 'inv1' });
    const inv2 = makeInvoice({ id: 'inv2' });
    mockedService.getInvoices
      .mockResolvedValueOnce(makePaginatedResponse([inv1]) as any)
      .mockResolvedValueOnce(makePaginatedResponse([inv2]) as any);

    const store = useInvoicesStore();
    await store.fetchInvoices('e1' as any);
    await store.fetchInvoices('e1' as any, undefined, true);

    expect(store.invoices).toHaveLength(2);
  });

  it('unpaidInvoices excludes paid and cancelled', () => {
    const store = useInvoicesStore();
    store.invoices = [
      makeInvoice({ id: '1', status: 'unpaid' }),
      makeInvoice({ id: '2', status: 'paid' }),
      makeInvoice({ id: '3', status: 'cancelled' }),
    ] as any;

    expect(store.unpaidInvoices).toHaveLength(1);
    expect(store.unpaidInvoices[0]?.id).toBe('1');
  });

  it('overdueInvoices returns only overdue', () => {
    const store = useInvoicesStore();
    store.invoices = [
      makeInvoice({ id: '1', status: 'overdue' }),
      makeInvoice({ id: '2', status: 'unpaid' }),
    ] as any;

    expect(store.overdueInvoices).toHaveLength(1);
  });

  it('totalUnpaid sums balance_due of unpaid invoices', () => {
    const store = useInvoicesStore();
    store.invoices = [
      makeInvoice({ status: 'sent', total_payable: 100 }),
      makeInvoice({ status: 'overdue', total_payable: 50 }),
      makeInvoice({ status: 'paid', total_payable: 200 }),
    ] as any;

    expect(store.totalUnpaid).toBe(150);
  });

  it('setStatusFilter updates filter', () => {
    const store = useInvoicesStore();
    store.setStatusFilter('paid' as any);
    expect(store.statusFilter).toBe('paid');
  });

  it('fetchInvoiceHistory fetches corrections, logs, activities', async () => {
    mockedService.getCorrections.mockResolvedValueOnce([{ id: 'c1' }] as any);
    mockedService.getStatusLogs.mockResolvedValueOnce([{ id: 'l1' }] as any);
    mockedService.getActivities.mockResolvedValueOnce({
      data: [{ id: 'a1' }],
      meta: { current_page: 1, last_page: 1, total: 1 },
    } as any);

    const store = useInvoicesStore();
    await store.fetchInvoiceHistory('e1', 'inv1');

    expect(store.corrections).toHaveLength(1);
    expect(store.statusLogs).toHaveLength(1);
    expect(store.activities).toHaveLength(1);
    expect(store.isLoadingHistory).toBe(false);
  });

  it('fetchInvoice sets currentInvoice', async () => {
    const inv = makeInvoice({ id: 'inv99' });
    mockedService.getInvoice.mockResolvedValueOnce(inv as any);

    const store = useInvoicesStore();
    const result = await store.fetchInvoice('e1' as any, 'inv99' as any);

    expect(result).toEqual(inv);
    expect(store.currentInvoice).toEqual(inv);
    expect(store.isLoading).toBe(false);
  });

  it('setSortBy updates sortBy', () => {
    const store = useInvoicesStore();
    store.setSortBy('issue_date');
    expect(store.sortBy).toBe('issue_date');
  });

  it('clearCurrentInvoice nullifies currentInvoice', () => {
    const store = useInvoicesStore();
    store.currentInvoice = makeInvoice() as any;
    store.clearCurrentInvoice();
    expect(store.currentInvoice).toBeNull();
  });

  it('hasMore is true when current_page < last_page', () => {
    const store = useInvoicesStore();
    store.pagination = { current_page: 1, last_page: 3, total: 60, per_page: 20 } as any;
    expect(store.hasMore).toBe(true);
  });

  it('hasMore is false when on last page', () => {
    const store = useInvoicesStore();
    store.pagination = { current_page: 3, last_page: 3, total: 60, per_page: 20 } as any;
    expect(store.hasMore).toBe(false);
  });

  it('hasMore is false when pagination is null', () => {
    const store = useInvoicesStore();
    expect(store.hasMore).toBe(false);
  });

  it('clearInvoiceHistory resets history state', async () => {
    mockedService.getCorrections.mockResolvedValueOnce([{ id: 'c1' }] as any);
    mockedService.getStatusLogs.mockResolvedValueOnce([{ id: 'l1' }] as any);
    mockedService.getActivities.mockResolvedValueOnce({
      data: [{ id: 'a1' }],
      meta: { current_page: 1, last_page: 1, total: 1 },
    } as any);

    const store = useInvoicesStore();
    await store.fetchInvoiceHistory('e1', 'inv1');
    expect(store.corrections).toHaveLength(1);

    store.clearInvoiceHistory();
    expect(store.corrections).toHaveLength(0);
    expect(store.statusLogs).toHaveLength(0);
    expect(store.activities).toHaveLength(0);
    expect(store.activitiesPagination).toEqual({ page: 1, lastPage: 1, total: 0 });
  });

  it('reset clears invoices and filters', () => {
    const store = useInvoicesStore();
    store.invoices = [makeInvoice()] as any;
    store.setStatusFilter('paid' as any);
    store.reset();
    expect(store.invoices).toHaveLength(0);
    expect(store.statusFilter).toBeNull();
  });

  it('fetchInvoices applies statusFilter as query param', async () => {
    const inv = makeInvoice({ status: 'paid' });
    mockedService.getInvoices.mockResolvedValueOnce(makePaginatedResponse([inv]) as any);

    const store = useInvoicesStore();
    store.setStatusFilter('paid' as any);
    await store.fetchInvoices('e1' as any);

    const callArgs = mockedService.getInvoices.mock.calls[0]!;
    expect(callArgs[0]).toBe('e1');
  });

  it('fetchInvoices sets error state on failure', async () => {
    mockedService.getInvoices.mockRejectedValueOnce(new Error('network fail'));

    const store = useInvoicesStore();
    await expect(store.fetchInvoices('e1' as any)).rejects.toThrow('network fail');
    expect(store.error).toBe('network fail');
    expect(store.isLoading).toBe(false);
  });
});
