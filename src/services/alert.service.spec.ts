/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dismissAlertOnResource, alertService } from './alert.service';
import { api } from 'src/boot/axios';

vi.mock('src/boot/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedPost = vi.mocked(api.post);

describe('alertService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('dismissAlertOnResource', () => {
    it('calls the polymorphic dismiss endpoint', async () => {
      const alert = { id: 'a1', uuid: 'u1', entity_id: 'e1', alert_type_id: 't1', alertable_type: 'invoice', alertable_id: 'i1', recipient_type: 'Contact', recipient_id: 'c1', channel: 'in_app' as const, priority: 'normal' as const, subject: 'Test', status: 'sent' as const, created_at: '' };
      mockedPost.mockResolvedValueOnce({ data: { data: alert } });

      const result = await dismissAlertOnResource('e1', 'invoice', 'i1', 'a1');

      expect(mockedPost).toHaveBeenCalledWith('/entities/e1/invoice/i1/alerts/a1/dismiss');
      expect(result).toEqual(alert);
    });
  });

  describe('dismissAlert', () => {
    it('calls the contact dismiss endpoint', async () => {
      mockedPost.mockResolvedValueOnce({ data: { data: {} } });
      await alertService.dismissAlert('e1', 'c1', 'a1');
      expect(mockedPost).toHaveBeenCalledWith('/entities/e1/contacts/c1/alerts/a1/dismiss');
    });
  });

  describe('getAlerts', () => {
    it('calls correct endpoint and returns paginated data', async () => {
      const mockGet = vi.mocked(api.get);
      const pageData = { data: [], meta: { current_page: 1, last_page: 1, total: 0 } };
      mockGet.mockResolvedValueOnce({ data: pageData });

      const result = await alertService.getAlerts('e1', 'c1', { page: 1, per_page: 20 });

      expect(mockGet.mock.calls[0]![0]).toBe('/entities/e1/contacts/c1/alerts');
      expect(result).toEqual(pageData);
    });
  });

  describe('getAlertStats', () => {
    it('calls stats endpoint', async () => {
      const mockGet = vi.mocked(api.get);
      const stats = { total: 10, unread: 3 };
      mockGet.mockResolvedValueOnce({ data: { data: stats } });

      const result = await alertService.getAlertStats('e1');

      expect(mockGet.mock.calls[0]![0]).toBe('/entities/e1/alerts/stats');
      expect(result).toEqual(stats);
    });
  });

  describe('bulkDismissAlerts', () => {
    it('posts alert_ids to bulk-dismiss endpoint', async () => {
      mockedPost.mockResolvedValueOnce({ data: { data: { success: ['a1'], failed: [] } } });

      const result = await alertService.bulkDismissAlerts('e1', 'c1', ['a1']);

      expect(mockedPost).toHaveBeenCalledWith(
        '/entities/e1/contacts/c1/alerts/bulk-dismiss',
        { alert_ids: ['a1'] }
      );
      expect(result).toEqual({ success: ['a1'], failed: [] });
    });
  });
});
