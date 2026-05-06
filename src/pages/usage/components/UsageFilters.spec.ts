/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import UsageFilters from './UsageFilters.vue';

const baseReading = {
  id: 'r1',
  reading: 150,
  reading_date: '2024-01-15',
  status: 'approved',
  source: 'customer',
  meter_id: 'm1',
  subscription_id: 's1',
  previous_index: 0,
  current_index: 150,
  created_at: '2024-01-15',
  updated_at: '2024-01-15',
};

function mountFilters(overrides = {}) {
  return mount(UsageFilters, {
    props: {
      meterOptions: [{ label: 'MTR-001', value: 'm1' }],
      selectedMeterUnit: 'm³',
      readings: [baseReading],
      isSubmitting: false,
      ...overrides,
    },
    global: {
      stubs: {
        'q-icon': true,
        'q-dialog': { template: '<div><slot /></div>' },
        'q-form': { template: '<form @submit.prevent="$emit(\'submit\')"><slot /></form>' },
        'q-select': true,
        'q-input': true,
        'q-date': true,
        'q-btn': true,
        'q-spinner-dots': true,
        'q-popup-proxy': { template: '<div><slot /></div>' },
        EmptyState: true,
      },
    },
  });
}

describe('UsageFilters', () => {
  it('renders submit and history buttons', () => {
    const w = mountFilters();
    const buttons = w.findAll('.action-btn');
    expect(buttons.length).toBe(2);
  });

  it('opens submit dialog when submit button clicked', async () => {
    const w = mountFilters();
    await w.find('.action-btn--primary').trigger('click');
    expect(w.find('.dialog-sheet').exists()).toBe(true);
  });

  it('disables submit button when isSubmitting is true', () => {
    const w = mountFilters({ isSubmitting: true });
    // The submit button should have disabled attribute
    const submitBtn = w.find('.submit-btn');
    expect(submitBtn.attributes('disabled')).toBeDefined();
  });

  it('emits submit-reading with form payload', async () => {
    const w = mountFilters();
    // Set internal form state
    const vm = w.vm as any;
    vm.readingForm.meter_id = 'm1';
    vm.readingForm.reading = 155;
    await vm.handleSubmitReading();
    const emitted = w.emitted('submit-reading');
    expect(emitted).toBeTruthy();
    expect(emitted?.[0]?.[0]).toMatchObject({ meter_id: 'm1', reading: 155 });
  });

  it('does not emit when meter_id is null', async () => {
    const w = mountFilters();
    const vm = w.vm as any;
    vm.readingForm.meter_id = null;
    vm.readingForm.reading = 155;
    await vm.handleSubmitReading();
    expect(w.emitted('submit-reading')).toBeFalsy();
  });
});
