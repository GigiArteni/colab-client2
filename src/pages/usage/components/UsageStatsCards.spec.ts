import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import UsageStatsCards from './UsageStatsCards.vue';
import type { Meter } from 'src/types';

const baseMeter: Meter = { id: 'm1', serial_number: 'MTR-001', is_active: true, unit: 'm³', entity_id: 'e1', type: 'smart', group: 'natural-gas', status: 'active', created_at: '2024-01-01', updated_at: '2024-01-01' };

function mountCard(overrides = {}) {
  return mount(UsageStatsCards, {
    props: {
      isLoading: false,
      currentMonthUsage: 120,
      usageUnit: 'm³',
      usageTrend: 'down',
      usageChangePercent: -5,
      meters: [baseMeter],
      activeMeters: [baseMeter],
      selectedMeterId: 'm1',
      ...overrides,
    },
    global: { stubs: { 'q-icon': true, LoadingSkeleton: true } },
  });
}

describe('UsageStatsCards', () => {
  it('renders current month usage value', () => {
    const w = mountCard();
    expect(w.text()).toContain('120');
  });

  it('shows trend badge with correct modifier class', () => {
    const w = mountCard({ usageTrend: 'up' });
    expect(w.find('.stats-card__trend--up').exists()).toBe(true);
  });

  it('hides meter selector when only one meter', () => {
    const w = mountCard({ meters: [baseMeter] });
    // With 1 meter, .meter-selector should not render
    expect(w.find('.meter-selector').exists()).toBe(false);
  });

  it('shows meter selector with multiple meters', () => {
    const meter2 = { ...baseMeter, id: 'm2', serial_number: 'MTR-002' };
    const w = mountCard({ meters: [baseMeter, meter2], activeMeters: [baseMeter, meter2] });
    expect(w.find('.meter-selector').exists()).toBe(true);
    expect(w.findAll('.meter-chip').length).toBe(2);
  });

  it('emits select-meter when chip clicked', async () => {
    const meter2 = { ...baseMeter, id: 'm2', serial_number: 'MTR-002' };
    const w = mountCard({ meters: [baseMeter, meter2], activeMeters: [baseMeter, meter2] });
    await w.findAll('.meter-chip')[1]!.trigger('click');
    expect(w.emitted('select-meter')?.[0]).toEqual(['m2']);
  });

  it('shows loading skeleton when isLoading is true', () => {
    const w = mountCard({ isLoading: true });
    expect(w.findComponent({ name: 'LoadingSkeleton' }).exists()).toBe(true);
  });
});
