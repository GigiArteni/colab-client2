import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('src/boot/axios', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import { useUsageStore } from './usage';
import { usageService } from 'src/services/usage.service';
import type { Meter, MeterReading, UsageRecord, UsageStatistics } from 'src/types';

vi.mock('src/services/usage.service');
const mockedService = vi.mocked(usageService);

type Mocked<T extends object> = { [K in keyof T]: ReturnType<typeof vi.fn> };
const m = mockedService as unknown as Mocked<typeof usageService>;

const makeUsage = (overrides: Partial<UsageRecord> = {}): UsageRecord => ({
  id: 'u1',
  subscription_id: 's1',
  meter_id: 'm1',
  reading_start_date: '2026-04-01',
  reading_end_date: '2026-04-30',
  consumption: 50,
  created_at: '2026-04-30T00:00:00Z',
  updated_at: '2026-04-30T00:00:00Z',
  ...overrides,
});

const makeMeter = (overrides: Partial<Meter> & { id?: string; is_active?: boolean } = {}): Meter =>
  ({
    id: 'm1',
    entity_id: 'e1',
    is_active: true,
    last_reading: 1000,
    last_reading_date: '2026-04-01',
    ...overrides,
  }) as unknown as Meter;

const makePaginated = <T>(data: T[]) => ({
  data,
  meta: { pagination: { current_page: 1, last_page: 1, total: data.length, per_page: 20 } },
});

describe('useUsageStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetchUsages with subscriptionId calls getSubscriptionUsages', async () => {
    const usages = [makeUsage()];
    m.getSubscriptionUsages.mockResolvedValueOnce(makePaginated(usages));

    const store = useUsageStore();
    await store.fetchUsages('e1', 's1');

    expect(store.usages).toEqual(usages);
  });

  it('fetchUsages without subscriptionId calls getUsages', async () => {
    const usages = [makeUsage()];
    m.getUsages.mockResolvedValueOnce(makePaginated(usages));

    const store = useUsageStore();
    await store.fetchUsages('e1');

    expect(store.usages).toEqual(usages);
  });

  it('activeMeters filters by is_active', () => {
    const store = useUsageStore();
    store.meters = [
      makeMeter({ id: 'm1', is_active: true }),
      makeMeter({ id: 'm2', is_active: false }),
    ];
    expect(store.activeMeters).toHaveLength(1);
    expect(store.activeMeters[0]?.id).toBe('m1');
  });

  it('filteredUsages returns all when no meter selected', () => {
    const store = useUsageStore();
    store.usages = [makeUsage({ meter_id: 'm1' }), makeUsage({ id: 'u2', meter_id: 'm2' })];
    expect(store.filteredUsages).toHaveLength(2);
  });

  it('filteredUsages filters by selectedMeterId', () => {
    const store = useUsageStore();
    store.usages = [makeUsage({ meter_id: 'm1' }), makeUsage({ id: 'u2', meter_id: 'm2' })];
    store.selectMeter('m1');
    expect(store.filteredUsages).toHaveLength(1);
    expect(store.filteredUsages[0]?.meter_id).toBe('m1');
  });

  it('submitReading prepends reading and updates meter', async () => {
    const reading: Partial<MeterReading> = { id: 'r1', reading_end_date: '2026-05-01' };
    m.submitReading.mockResolvedValueOnce(reading);

    const store = useUsageStore();
    store.meters = [makeMeter({ id: 'm1' })];

    await store.submitReading('e1', 's1', {
      meter_id: 'm1',
      current_index: 1234,
      reading_date: '2026-05-01',
    });

    expect(store.readings[0]).toEqual(reading);
    expect((store.meters[0] as { last_reading?: number }).last_reading).toBe(1234);
  });

  it('fetchMeters populates meters and auto-selects first', async () => {
    const meters = [makeMeter({ id: 'm1' }), makeMeter({ id: 'm2', is_active: false })];
    m.getMeters.mockResolvedValueOnce(meters);

    const store = useUsageStore();
    await store.fetchMeters('e1', 's1');

    expect(store.meters).toHaveLength(2);
    expect(store.selectedMeterId).toBe('m1');
  });

  it('fetchMeters does not override existing selectedMeterId', async () => {
    const meters = [makeMeter({ id: 'm2' })];
    m.getMeters.mockResolvedValueOnce(meters);

    const store = useUsageStore();
    store.selectMeter('m99');
    await store.fetchMeters('e1', 's1');

    expect(store.selectedMeterId).toBe('m99');
  });

  it('fetchMeterReadings populates readings', async () => {
    const readings: Partial<MeterReading>[] = [{ id: 'r1', reading_end_date: '2026-05-01' }];
    m.getMeterReadings.mockResolvedValueOnce({ data: readings });

    const store = useUsageStore();
    await store.fetchMeterReadings('e1', 's1', 'm1');

    expect(store.readings).toEqual(readings);
  });

  it('fetchStatistics populates statistics', async () => {
    const stats: UsageStatistics = {
      current_month: 100,
      previous_month: 80,
      change_percent: 25,
      trend: 'up',
      unit: 'm³',
      total_year: 500,
      average_monthly: 83,
      same_month_last_year: null,
    };
    m.getStatistics.mockResolvedValueOnce(stats);

    const store = useUsageStore();
    await store.fetchStatistics('e1', 's1');

    expect(store.currentMonthUsage).toBe(100);
    expect(store.usageTrend).toBe('up');
  });

  it('fetchStatistics sets defaults on error', async () => {
    m.getStatistics.mockRejectedValueOnce(new Error('fail'));

    const store = useUsageStore();
    await store.fetchStatistics('e1', 's1');

    expect(store.currentMonthUsage).toBe(0);
    expect(store.usageTrend).toBe('stable');
  });

  it('selectedMeter returns meter matching selectedMeterId', () => {
    const store = useUsageStore();
    store.meters = [makeMeter({ id: 'm1' }), makeMeter({ id: 'm2' })];
    store.selectMeter('m2');
    expect(store.selectedMeter?.id).toBe('m2');
  });

  it('selectedMeter returns null when no match', () => {
    const store = useUsageStore();
    store.meters = [makeMeter({ id: 'm1' })];
    store.selectMeter('m99');
    expect(store.selectedMeter).toBeNull();
  });

  it('chartData sorts by reading_end_date and slices last 12', () => {
    const store = useUsageStore();
    store.usages = [
      makeUsage({ id: 'u1', reading_end_date: '2026-01-31', consumption: 10 }),
      makeUsage({ id: 'u2', reading_end_date: '2026-03-31', consumption: 30 }),
      makeUsage({ id: 'u3', reading_end_date: '2026-02-28', consumption: 20 }),
    ];

    const { data } = store.chartData;
    expect(data).toEqual([10, 20, 30]);
  });

  it('fetchUsages sets error on failure', async () => {
    m.getUsages.mockRejectedValueOnce(new Error('api error'));

    const store = useUsageStore();
    await expect(store.fetchUsages('e1')).rejects.toThrow('api error');
    expect(store.error).toBe('api error');
    expect(store.isLoading).toBe(false);
  });

  it('reset clears all state', () => {
    const store = useUsageStore();
    store.usages = [makeUsage()];
    store.selectMeter('m1');
    store.reset();
    expect(store.usages).toHaveLength(0);
    expect(store.selectedMeterId).toBeNull();
  });
});
