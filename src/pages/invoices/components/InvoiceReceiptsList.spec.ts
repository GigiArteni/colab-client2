import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import InvoiceReceiptsList from './InvoiceReceiptsList.vue';

const globalOpts = {
  global: {
    stubs: {
      QCard: { template: '<div class="q-card"><slot /></div>' },
      QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
      QList: { template: '<ul><slot /></ul>' },
      QItem: { template: '<li class="q-item"><slot /></li>' },
      QItemSection: { template: '<div class="q-item-section"><slot /></div>' },
      QItemLabel: { template: '<span class="q-item-label"><slot /></span>' },
      QIcon: true,
      QChip: { template: '<span class="q-chip"><slot /></span>' },
      QSeparator: true,
    },
  },
};

const receipts = [
  { id: 'r-1', amount: 120.5, paid_at: '2026-01-15', payment_method: 'card', is_completed: true },
  { id: 'r-2', amount: 80, paid_at: '2026-02-01', payment_method: 'bank_transfer', is_completed: true },
];

describe('InvoiceReceiptsList', () => {
  it('renders nothing when receipts is empty', () => {
    const wrapper = mount(InvoiceReceiptsList, { props: { receipts: [], currency: 'RON' }, ...globalOpts });
    expect(wrapper.find('.q-card').exists()).toBe(false);
  });

  it('renders nothing when receipts is undefined', () => {
    const wrapper = mount(InvoiceReceiptsList, { props: { receipts: undefined, currency: 'RON' }, ...globalOpts });
    expect(wrapper.find('.q-card').exists()).toBe(false);
  });

  it('renders a row for each receipt', () => {
    const wrapper = mount(InvoiceReceiptsList, { props: { receipts, currency: 'RON' }, ...globalOpts });
    expect(wrapper.findAll('.q-item')).toHaveLength(2);
  });

  it('formats amounts as currency', () => {
    const wrapper = mount(InvoiceReceiptsList, { props: { receipts, currency: 'RON' }, ...globalOpts });
    expect(wrapper.text()).toContain('120');
  });
});
