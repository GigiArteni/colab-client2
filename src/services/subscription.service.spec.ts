/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { subscriptionService } from './subscription.service';
import { api } from 'src/boot/axios';

vi.mock('src/boot/axios', () => ({
  api: {
    get: vi.fn(),
  },
}));

const mockedGet = vi.mocked(api.get);

describe('subscriptionService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('getCustomer', () => {
    it('fetches customer from correct endpoint', async () => {
      const customer = { id: 'c1', type: 'Contact', name: 'Ion Popescu', email: 'ion@example.com' };
      mockedGet.mockResolvedValueOnce({ data: { data: customer } });

      const result = await subscriptionService.getCustomer('e1', 's1');

      expect(mockedGet).toHaveBeenCalledWith('/entities/e1/subscriptions/s1/customer');
      expect(result).toEqual(customer);
    });
  });

  describe('getSubscription', () => {
    it('returns subscription data', async () => {
      const sub = { id: 's1', entity_id: 'e1', group: 'natural-gas', is_active: true, created_at: '', updated_at: '' };
      mockedGet.mockResolvedValueOnce({ data: { data: sub } });

      const result = await subscriptionService.getSubscription('e1', 's1');
      expect(result).toEqual(sub);
    });
  });

  describe('getSubscriptions', () => {
    it('fetches all subscriptions for entity', async () => {
      const subs = [{ id: 's1' }, { id: 's2' }];
      mockedGet.mockResolvedValueOnce({ data: { data: subs } });

      const result = await subscriptionService.getSubscriptions('e1');

      expect(mockedGet.mock.calls[0]![0]).toBe('/entities/e1/subscriptions');
      expect(result).toEqual(subs);
    });

    it('passes params to endpoint', async () => {
      mockedGet.mockResolvedValueOnce({ data: { data: [] } });

      await subscriptionService.getSubscriptions('e1', { 'filter[group]': 'natural-gas' });

      expect(mockedGet).toHaveBeenCalledWith('/entities/e1/subscriptions', {
        params: { 'filter[group]': 'natural-gas' },
      });
    });
  });

  describe('getMeters', () => {
    it('fetches meters for subscription', async () => {
      const meters = [{ id: 'm1', serial_number: 'SN001' }];
      mockedGet.mockResolvedValueOnce({ data: { data: meters } });

      const result = await subscriptionService.getMeters('e1', 's1');

      expect(mockedGet.mock.calls[0]![0]).toBe('/entities/e1/subscriptions/s1/meters');
      expect(result).toEqual(meters);
    });
  });

  describe('getUsageStatistics', () => {
    it('fetches usage statistics', async () => {
      const stats = { current_month: 100, previous_month: 80 };
      mockedGet.mockResolvedValueOnce({ data: { data: stats } });

      const result = await subscriptionService.getUsageStatistics('e1', 's1');

      expect(mockedGet.mock.calls[0]![0]).toBe('/entities/e1/subscriptions/s1/statistics/usage');
      expect(result).toEqual(stats);
    });
  });

  describe('getFinancialStatistics', () => {
    it('fetches financial statistics', async () => {
      const stats = { total_invoiced: 500, total_paid: 400 };
      mockedGet.mockResolvedValueOnce({ data: { data: stats } });

      const result = await subscriptionService.getFinancialStatistics('e1', 's1');

      expect(mockedGet.mock.calls[0]![0]).toBe('/entities/e1/subscriptions/s1/statistics/financial');
      expect(result).toEqual(stats);
    });
  });
});
