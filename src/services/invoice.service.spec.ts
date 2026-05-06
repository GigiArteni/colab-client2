/**
 * invoice.service — corrections, status-logs, activities endpoints
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();

vi.mock('src/boot/axios', () => ({
  api: { get: (url: string, config?: unknown) => get(url, config) },
}));

import { invoiceService } from './invoice.service';

const ENTITY = 'ent-1';
const INVOICE = 'inv-99';

describe('invoiceService.getCorrections', () => {
  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue({ data: { data: [], meta: { current_page: 1, last_page: 1, total: 0 } } });
  });

  it('calls the corrections endpoint', async () => {
    await invoiceService.getCorrections(ENTITY, INVOICE);
    expect(get.mock.calls[0]![0]).toBe(`/entities/${ENTITY}/invoices/${INVOICE}/corrections`);
  });

  it('returns the data array from the response', async () => {
    const correction = { id: 'c-1', number: 'S001', status: 'sent', total_payable: '100' };
    get.mockResolvedValueOnce({ data: { data: [correction] } });
    const result = await invoiceService.getCorrections(ENTITY, INVOICE);
    expect(result).toEqual([correction]);
  });
});

describe('invoiceService.getStatusLogs', () => {
  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue({ data: { data: [] } });
  });

  it('calls the status-logs endpoint', async () => {
    await invoiceService.getStatusLogs(ENTITY, INVOICE);
    expect(get.mock.calls[0]![0]).toBe(`/entities/${ENTITY}/invoices/${INVOICE}/status-logs`);
  });

  it('returns the data array from the response', async () => {
    const log = { id: 'l-1', invoice_id: INVOICE, to_status: 'paid', created_at: '2026-01-01' };
    get.mockResolvedValueOnce({ data: { data: [log] } });
    const result = await invoiceService.getStatusLogs(ENTITY, INVOICE);
    expect(result).toEqual([log]);
  });
});

describe('invoiceService.getActivities', () => {
  const paginated = {
    data: [],
    meta: { current_page: 1, last_page: 1, total: 0, per_page: 20 },
  };

  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue({ data: paginated });
  });

  it('calls the activities endpoint with causer include', async () => {
    await invoiceService.getActivities(ENTITY, INVOICE);
    expect(get).toHaveBeenCalledWith(
      `/entities/${ENTITY}/invoices/${INVOICE}/activities`,
      expect.objectContaining({ params: expect.objectContaining({ include: 'causer' }) })
    );
  });

  it('forwards page and per_page params', async () => {
    await invoiceService.getActivities(ENTITY, INVOICE, { page: 2, per_page: 10 });
    expect(get).toHaveBeenCalledWith(
      `/entities/${ENTITY}/invoices/${INVOICE}/activities`,
      expect.objectContaining({
        params: expect.objectContaining({ page: 2, per_page: 10 }),
      })
    );
  });

  it('returns the full paginated response', async () => {
    const activity = { id: 'a-1', type: 'invoice.sent', type_label: 'Invoice Sent', created_at: '2026-01-01' };
    const response = { data: [activity], meta: { current_page: 1, last_page: 1, total: 1, per_page: 20 } };
    get.mockResolvedValueOnce({ data: response });
    const result = await invoiceService.getActivities(ENTITY, INVOICE);
    expect(result).toEqual(response);
  });
});
