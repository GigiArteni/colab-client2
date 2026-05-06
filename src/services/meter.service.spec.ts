import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();
const post = vi.fn();

vi.mock('src/boot/axios', () => ({
  api: {
    get: (url: string, opts?: unknown) => get(url, opts),
    post: (url: string, body?: unknown) => post(url, body),
  },
}));

import { meterService } from './meter.service';

const E = 'e1';
const M = 'm1';
const S = 's1';

describe('meterService', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it('getMeters calls correct URL with include param', async () => {
    get.mockResolvedValueOnce({ data: { data: [] } });

    await meterService.getMeters(E);

    expect(get).toHaveBeenCalledWith(
      `/entities/${E}/meters`,
      expect.objectContaining({ params: expect.objectContaining({ include: 'subscription,creator' }) })
    );
  });

  it('getMeters passes filters as query params', async () => {
    get.mockResolvedValueOnce({ data: { data: [] } });

    await meterService.getMeters(E, { status: 'active', search: 'foo' });

    const [, opts] = get.mock.calls[0]!;
    expect((opts).params['filter[status]']).toBe('active');
    expect((opts).params['search']).toBe('foo');
  });

  it('getMeter calls single meter endpoint', async () => {
    const meter = { id: M };
    get.mockResolvedValueOnce({ data: { data: meter } });

    const result = await meterService.getMeter(E, M);

    expect(get).toHaveBeenCalledWith(
      `/entities/${E}/meters/${M}`,
      expect.anything()
    );
    expect(result).toEqual(meter);
  });

  it('getSubscriptionMeters calls correct URL', async () => {
    get.mockResolvedValueOnce({ data: { data: [] } });

    await meterService.getSubscriptionMeters(E, S);

    expect(get).toHaveBeenCalledWith(
      `/entities/${E}/subscriptions/${S}/meters`,
      expect.anything()
    );
  });

  it('getStatusCounts calls status-counts endpoint', async () => {
    const counts = { active: 2, inactive: 1 };
    get.mockResolvedValueOnce({ data: { data: counts } });

    const result = await meterService.getStatusCounts(E);

    expect(get).toHaveBeenCalledWith(
      `/entities/${E}/meters/status-counts`,
      expect.anything()
    );
    expect(result).toEqual(counts);
  });

  it('getActivities returns paginated response', async () => {
    const pageData = { data: [], meta: { current_page: 1, last_page: 1, total: 0 } };
    get.mockResolvedValueOnce({ data: pageData });

    const result = await meterService.getActivities(E, M);

    expect(get).toHaveBeenCalledWith(
      `/entities/${E}/meters/${M}/activities`,
      expect.anything()
    );
    expect(result).toEqual(pageData);
  });

  it('getReadings queries subscription usages endpoint', async () => {
    const pageData = { data: [], meta: { current_page: 1, last_page: 1, total: 0 } };
    get.mockResolvedValueOnce({ data: pageData });

    await meterService.getReadings(E, S, M);

    const [url, opts] = get.mock.calls[0]!;
    expect(url).toBe(`/entities/${E}/subscriptions/${S}/usages`);
    expect((opts).params['filter[meter_id]']).toBe(M);
  });

  it('submitReading posts to usages with correct payload', async () => {
    const reading = { id: 'r1' };
    post.mockResolvedValueOnce({ data: { data: reading } });

    const result = await meterService.submitReading(E, S, M, {
      current_index: 1234,
      reading_date: '2026-05-01',
    });

    const [url, body] = post.mock.calls[0]!;
    expect(url).toBe(`/entities/${E}/subscriptions/${S}/usages`);
    expect((body).meter_id).toBe(M);
    expect((body).current_index).toBe(1234);
    expect((body).reading_source).toBe('customer');
    expect(result).toEqual(reading);
  });
});
