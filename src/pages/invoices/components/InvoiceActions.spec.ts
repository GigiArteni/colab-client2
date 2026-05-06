import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import InvoiceActions from './InvoiceActions.vue';

const globalOpts = {
  global: {
    stubs: {
      QBtn: {
        template: '<button @click="$emit(\'click\')"><slot /></button>',
        emits: ['click'],
      },
    },
  },
};

describe('InvoiceActions', () => {
  it('always renders download PDF button', () => {
    const wrapper = mount(InvoiceActions, { props: { balanceDue: 0 }, ...globalOpts });
    expect(wrapper.findAll('button').length).toBeGreaterThanOrEqual(1);
  });

  it('hides pay button when balanceDue is 0', () => {
    const wrapper = mount(InvoiceActions, { props: { balanceDue: 0 }, ...globalOpts });
    expect(wrapper.findAll('button')).toHaveLength(1);
  });

  it('shows pay button when balanceDue > 0', () => {
    const wrapper = mount(InvoiceActions, { props: { balanceDue: 100 }, ...globalOpts });
    expect(wrapper.findAll('button')).toHaveLength(2);
  });

  it('emits download-pdf on first button click', async () => {
    const wrapper = mount(InvoiceActions, { props: { balanceDue: 0 }, ...globalOpts });
    await wrapper.findAll('button')[0]!.trigger('click');
    expect(wrapper.emitted('download-pdf')).toBeTruthy();
  });

  it('emits pay on second button click', async () => {
    const wrapper = mount(InvoiceActions, { props: { balanceDue: 50 }, ...globalOpts });
    await wrapper.findAll('button')[1]!.trigger('click');
    expect(wrapper.emitted('pay')).toBeTruthy();
  });
});
