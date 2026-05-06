/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('src/boot/axios', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import { useMeterStore } from './meter';
import { meterService } from 'src/services/meter.service';

vi.mock('src/services/meter.service');
const mockedService = vi.mocked(meterService);

const makeMeter = (overrides = {}) => ({
  id: 'm1',
  group: 'natural-gas',
  status: 'active',
  current_index: 1000,
  last_reading_date: '2026-04-01',
  ...overrides,
});

const makePaginated = (data: unknown[]) => ({
  data,
  meta: { current_page: 1, last_page: 1, total: data.length, per_page: 20 },
});

describe('useMeterStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetchMeters populates meters', async () => {
    const meters = [makeMeter()];
    mockedService.getMeters.mockResolvedValueOnce(meters as any);

    const store = useMeterStore();
    await store.fetchMeters('e1');

    expect(store.meters).toEqual(meters);
    expect(store.hasMeters).toBe(true);
    expect(store.isLoading).toBe(false);
  });

  it('gasMeters filters by natural-gas group', () => {
    const store = useMeterStore();
    store.meters = [
      makeMeter({ id: 'm1', group: 'natural-gas' }),
      makeMeter({ id: 'm2', group: 'water' }),
    ] as any;
    expect(store.gasMeters).toHaveLength(1);
    expect(store.gasMeters[0]?.id).toBe('m1');
  });

  it('activeMeters filters by active status', () => {
    const store = useMeterStore();
    store.meters = [
      makeMeter({ id: 'm1', status: 'active' }),
      makeMeter({ id: 'm2', status: 'inactive' }),
    ] as any;
    expect(store.activeMeters).toHaveLength(1);
  });

  it('fetchMeter sets selectedMeter', async () => {
    const meter = makeMeter();
    mockedService.getMeter.mockResolvedValueOnce(meter as any);

    const store = useMeterStore();
    await store.fetchMeter('e1', 'm1');

    expect(store.selectedMeter).toEqual(meter);
  });

  it('fetchActivities populates activities and resets on page 1', async () => {
    mockedService.getActivities.mockResolvedValueOnce(makePaginated([{ id: 'a1' }]) as any);

    const store = useMeterStore();
    await store.fetchActivities('e1', 'm1', 1);

    expect(store.activities).toHaveLength(1);
  });

  it('fetchReadings populates readings', async () => {
    mockedService.getReadings.mockResolvedValueOnce(makePaginated([{ id: 'r1' }]) as any);

    const store = useMeterStore();
    await store.fetchReadings('e1', 's1', 'm1', 1);

    expect(store.readings).toHaveLength(1);
  });

  it('submitReading prepends reading and updates meter index', async () => {
    const reading = { id: 'r1', created_at: '2026-05-01' };
    mockedService.submitReading.mockResolvedValueOnce(reading as any);

    const store = useMeterStore();
    store.selectedMeter = makeMeter({ id: 'm1' }) as any;

    await store.submitReading('e1', 's1', 'm1', { current_index: 1234 });

    expect(store.readings[0]).toEqual(reading);
    expect(store.selectedMeter?.current_index).toBe(1234);
  });

  it('clearSelectedMeter resets selection and activities', () => {
    const store = useMeterStore();
    store.selectedMeter = makeMeter() as any;
    store.activities = [{ id: 'a1' }] as any;
    store.clearSelectedMeter();
    expect(store.selectedMeter).toBeNull();
    expect(store.activities).toHaveLength(0);
  });

  it('$reset clears all state', async () => {
    mockedService.getMeters.mockResolvedValueOnce([makeMeter()] as any);
    const store = useMeterStore();
    await store.fetchMeters('e1');
    store.$reset();
    expect(store.meters).toHaveLength(0);
    expect(store.isLoading).toBe(false);
  });
});
