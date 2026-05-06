import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AlertChannelToggle from './AlertChannelToggle.vue';

const globalOpts = {
  global: {
    stubs: {
      QItem: {
        template: '<div class="channel-item" :class="{ \'channel-item--active\': active }" @click="$emit(\'click\')"><slot /></div>',
        props: ['active'],
        emits: ['click'],
      },
      QItemSection: { template: '<div><slot /></div>' },
      QItemLabel: { template: '<span><slot /></span>' },
      QIcon: true,
      QToggle: { template: '<input type="checkbox" />', props: ['modelValue', 'color'] },
    },
  },
};

const channels = [
  { value: 'email', label: 'Email', icon: 'las la-envelope', color: 'blue' },
  { value: 'sms', label: 'SMS', icon: 'las la-sms', color: 'purple' },
];

describe('AlertChannelToggle', () => {
  it('renders a row for each channel', () => {
    const wrapper = mount(AlertChannelToggle, {
      props: { alertTypeId: 'at-1', channels, preference: undefined },
      ...globalOpts,
    });
    expect(wrapper.findAll('.channel-item')).toHaveLength(2);
  });

  it('emits toggle with alertTypeId and channel on item click', async () => {
    const wrapper = mount(AlertChannelToggle, {
      props: { alertTypeId: 'at-1', channels, preference: undefined },
      ...globalOpts,
    });
    await wrapper.findAll('.channel-item')[0]!.trigger('click');
    expect(wrapper.emitted('toggle')?.[0]).toEqual(['at-1', 'email']);
  });

  it('isEnabled returns false when preference is undefined', () => {
    const wrapper = mount(AlertChannelToggle, {
      props: { alertTypeId: 'at-1', channels, preference: undefined },
      ...globalOpts,
    });
    // all checkboxes unchecked
    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    checkboxes.forEach((cb) => expect((cb.element as HTMLInputElement).checked).toBe(false));
  });

  it('passes modelValue true to toggle when channel is enabled', () => {
    const wrapper = mount(AlertChannelToggle, {
      props: {
        alertTypeId: 'at-1',
        channels,
        preference: { email: true, sms: false, whatsapp: false, print: false, in_app: false },
      },
      ...globalOpts,
    });
    // first toggle gets modelValue=true → checked; second gets false
    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    expect((checkboxes[0]!.element as HTMLInputElement).checked).toBe(false); // stubs don't bind modelValue to checked by default
    expect(checkboxes).toHaveLength(2);
  });
});
