import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import UsageReadingsTable from './UsageReadingsTable.vue';

const baseUsage = {
  id: 'u1',
  period_start: '2024-01-01',
  period_end: '2024-01-31',
  reading_start: 100,
  reading_end: 150,
  consumption: 50,
  unit: 'm³',
  is_estimated: false,
  meter_id: 'm1',
  subscription_id: 's1',
  reading_start_date: '2024-01-01',
  reading_end_date: '2024-01-31',
  created_at: '2024-01-01',
  updated_at: '2024-01-31',
};

function mountTable(usages = [baseUsage]) {
  return mount(UsageReadingsTable, {
    props: { usages },
    global: { stubs: { 'q-icon': true, EmptyState: true } },
  });
}

describe('UsageReadingsTable', () => {
  it('renders one row per usage', () => {
    const usages = [baseUsage, { ...baseUsage, id: 'u2' }];
    const w = mountTable(usages);
    expect(w.findAll('.usage-item').length).toBe(2);
  });

  it('shows EmptyState when no usages', () => {
    const w = mountTable([]);
    expect(w.findComponent({ name: 'EmptyState' }).exists()).toBe(true);
  });

  it('caps list at 6 items', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({ ...baseUsage, id: `u${i + 1}` }));
    const w = mountTable(many);
    expect(w.findAll('.usage-item').length).toBe(6);
  });

  it('shows estimated badge when is_estimated is true', () => {
    const w = mountTable([{ ...baseUsage, is_estimated: true }]);
    expect(w.find('.usage-item__badge').exists()).toBe(true);
  });

  it('does not show estimated badge when is_estimated is false', () => {
    const w = mountTable([baseUsage]);
    expect(w.find('.usage-item__badge').exists()).toBe(false);
  });
});
