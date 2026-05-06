import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ErrorBanner from './ErrorBanner.vue';

const globalOpts = {
  global: {
    stubs: {
      QBanner: { template: '<div role="alert"><slot /><slot name="avatar" /><slot name="action" /></div>' },
      QIcon: true,
      QBtn: { template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot>{{ $attrs.label }}</slot></button>' },
    },
  },
};

describe('ErrorBanner', () => {
  it('renders nothing when error is null', () => {
    const wrapper = mount(ErrorBanner, { props: { error: null }, ...globalOpts });
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  });

  it('renders string error message', () => {
    const wrapper = mount(ErrorBanner, { props: { error: 'Something went wrong' }, ...globalOpts });
    expect(wrapper.text()).toContain('Something went wrong');
  });

  it('renders Error object message', () => {
    const wrapper = mount(ErrorBanner, {
      props: { error: new Error('Network failure') },
      ...globalOpts,
    });
    expect(wrapper.text()).toContain('Network failure');
  });

  it('emits retry event on button click', async () => {
    const wrapper = mount(ErrorBanner, {
      props: { error: 'Oops', showRetry: true },
      ...globalOpts,
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('retry')).toBeTruthy();
  });

  it('hides retry button when showRetry is false', () => {
    const wrapper = mount(ErrorBanner, {
      props: { error: 'Oops', showRetry: false },
      ...globalOpts,
    });
    expect(wrapper.find('button').exists()).toBe(false);
  });
});
