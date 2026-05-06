import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import type { Component } from 'vue';
import * as LoginOtpStepMod from './LoginOtpStep.vue';
const LoginOtpStep = (LoginOtpStepMod as { default: Component }).default;
import type { OtpChannel } from 'src/types/auth.types';

const channels: OtpChannel[] = [
  { channel: 'email', label: 'Email', masked_destination: 'u***@example.com', preferred: true },
  { channel: 'sms', label: 'SMS', masked_destination: '+40***1234', preferred: false },
];

const globalOpts = {
  global: {
    stubs: {
      QIcon: true,
      QSpinner: true,
      QBanner: { template: '<div role="alert"><slot /></div>' },
    },
  },
};

describe('LoginOtpStep', () => {
  it('renders channel options', () => {
    const wrapper = mount(LoginOtpStep, {
      props: { identifier: 'user@example.com', channels, storeError: null },
      ...globalOpts,
    });
    expect(wrapper.findAll('.channel-option')).toHaveLength(2);
  });

  it('shows masked destinations', () => {
    const wrapper = mount(LoginOtpStep, {
      props: { identifier: 'user@example.com', channels, storeError: null },
      ...globalOpts,
    });
    expect(wrapper.text()).toContain('u***@example.com');
    expect(wrapper.text()).toContain('+40***1234');
  });

  it('emits select with channel when option clicked', async () => {
    const wrapper = mount(LoginOtpStep, {
      props: { identifier: 'user@example.com', channels, storeError: null },
      ...globalOpts,
    });
    await wrapper.findAll('.channel-option')[0]!.trigger('click');
    expect(wrapper.emitted('select')?.[0]).toEqual(['email']);
  });

  it('emits back when identifier badge is clicked', async () => {
    const wrapper = mount(LoginOtpStep, {
      props: { identifier: 'user@example.com', channels, storeError: null },
      ...globalOpts,
    });
    await wrapper.find('.identifier-badge').trigger('click');
    expect(wrapper.emitted('back')).toBeTruthy();
  });

  it('shows store error when provided', () => {
    const wrapper = mount(LoginOtpStep, {
      props: { identifier: 'user@example.com', channels, storeError: 'Request failed' },
      ...globalOpts,
    });
    expect(wrapper.text()).toContain('Request failed');
  });
});
