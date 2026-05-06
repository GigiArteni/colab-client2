import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LoadingSkeleton from './LoadingSkeleton.vue';

const globalOpts = {
  global: {
    stubs: {
      QSkeleton: { template: '<div class="q-skeleton" v-bind="$attrs" />' },
      QCard: { template: '<div class="q-card"><slot /></div>' },
      QCardSection: { template: '<div><slot /></div>' },
      QSeparator: true,
    },
  },
};

describe('LoadingSkeleton', () => {
  it('has role=status', () => {
    const wrapper = mount(LoadingSkeleton, { ...globalOpts });
    expect(wrapper.find('[role="status"]').exists()).toBe(true);
  });

  it('renders list variant by default with 3 rows', () => {
    const wrapper = mount(LoadingSkeleton, { ...globalOpts });
    expect(wrapper.findAll('.q-skeleton').length).toBe(3);
  });

  it('renders custom row count', () => {
    const wrapper = mount(LoadingSkeleton, { props: { variant: 'list', rows: 5 }, ...globalOpts });
    expect(wrapper.findAll('.q-skeleton').length).toBe(5);
  });

  it('renders card variant', () => {
    const wrapper = mount(LoadingSkeleton, { props: { variant: 'card' }, ...globalOpts });
    expect(wrapper.find('.q-card').exists()).toBe(true);
  });

  it('renders table variant', () => {
    const wrapper = mount(LoadingSkeleton, { props: { variant: 'table' }, ...globalOpts });
    expect(wrapper.findAll('.q-skeleton').length).toBeGreaterThanOrEqual(4);
  });
});
