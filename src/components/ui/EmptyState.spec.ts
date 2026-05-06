import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EmptyState from './EmptyState.vue';

describe('EmptyState', () => {
  it('renders title', () => {
    const wrapper = mount(EmptyState, { props: { title: 'No data' } });
    expect(wrapper.text()).toContain('No data');
  });

  it('renders optional subtitle', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'Empty', subtitle: 'Nothing here yet' },
    });
    expect(wrapper.text()).toContain('Nothing here yet');
  });

  it('omits subtitle when not provided', () => {
    const wrapper = mount(EmptyState, { props: { title: 'Empty' } });
    expect(wrapper.find('[data-test="subtitle"]').exists()).toBe(false);
  });

  it('renders default slot for action', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'Empty' },
      slots: { default: '<button>Add Item</button>' },
    });
    expect(wrapper.text()).toContain('Add Item');
  });
});
