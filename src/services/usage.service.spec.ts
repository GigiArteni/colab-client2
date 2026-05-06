import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();

vi.mock('src/boot/axios', () => ({
  api: { get: (url: string, opts?: unknown) => get(url, opts) },
}));

import { usageService } from './usage.service';

const E = 'e1';
const S = 's1';
const U = 'u1';

describe('usageService', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('getSubscriptionUsages calls correct endpoint and returns paginated response', async () => {
    const usages = [{ id: U }];
    get.mockResolvedValueOnce({ data: { data: usages, meta: {} } });

    const result = await usageService.getSubscriptionUsages(E, S);

    expect(get).toHaveBeenCalledWith(
      `/entities/${E}/subscriptions/${S}/usages`,
      expect.anything()
    );
    expect(result.data).toEqual(usages);
  });

  it('getSubscriptionUsages passes period filter', async () => {
    get.mockResolvedValueOnce({ data: { data: [], meta: {} } });

    await usageService.getSubscriptionUsages(E, S, { period: 'last_6_months' });

    const [, opts] = get.mock.calls[0]!;
    expect((opts as { params: Record<string, unknown> }).params['period']).toBe('last_6_months');
  });

  it('getSubscriptionUsages passes meter_id filter', async () => {
    get.mockResolvedValueOnce({ data: { data: [], meta: {} } });

    await usageService.getSubscriptionUsages(E, S, { meter_id: 'meter-42' });

    const [, opts] = get.mock.calls[0]!;
    expect((opts as { params: Record<string, unknown> }).params['filter[meter_id]']).toBe('meter-42');
  });

  it('getUsage calls single usage endpoint', async () => {
    const usage = { id: U };
    get.mockResolvedValueOnce({ data: { data: usage } });

    const result = await usageService.getUsage(E, S, U);

    expect(get.mock.calls[0]![0]).toBe(`/entities/${E}/subscriptions/${S}/usages/${U}`);
    expect(result).toEqual(usage);
  });
});
