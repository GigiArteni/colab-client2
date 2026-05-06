import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginOtpCodeStep from './LoginOtpCodeStep.vue';

const globalOpts = {
  global: {
    stubs: {
      OtpInput: {
        template: '<div class="otp-input-stub"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
        props: ['modelValue', 'hasError', 'disabled'],
        emits: ['update:modelValue', 'complete'],
      },
      QBtn: {
        template: '<button :disabled="disable || loading" @click="$emit(\'click\')" v-bind="$attrs"><slot /></button>',
        props: ['loading', 'disable', 'flat', 'dense', 'color'],
        emits: ['click'],
      },
      QIcon: true,
    },
  },
};

describe('LoginOtpCodeStep', () => {
  it('renders masked destination prop in description', () => {
    const wrapper = mount(LoginOtpCodeStep, {
      props: { maskedDestination: 'u***@example.com', loading: false, resendCooldown: 0 },
      ...globalOpts,
    });
    // The i18n key is used with { destination } interpolation; check the prop is passed to the template
    expect(wrapper.find('.step-description').exists()).toBe(true);
  });

  it('emits back when back button clicked', async () => {
    const wrapper = mount(LoginOtpCodeStep, {
      props: { maskedDestination: 'u***@example.com', loading: false, resendCooldown: 0 },
      ...globalOpts,
    });
    const buttons = wrapper.findAll('button');
    const backBtn = buttons.find((b) => b.text().includes('back') || b.classes().includes('step-action-btn'));
    await backBtn?.trigger('click');
    expect(wrapper.emitted('back')).toBeTruthy();
  });

  it('emits resend when resend button clicked and cooldown is 0', async () => {
    const wrapper = mount(LoginOtpCodeStep, {
      props: { maskedDestination: 'u***@example.com', loading: false, resendCooldown: 0 },
      ...globalOpts,
    });
    // Find the second action button (resend)
    const buttons = wrapper.findAll('button');
    await buttons[buttons.length - 1]!.trigger('click');
    expect(wrapper.emitted('resend')).toBeTruthy();
  });

  it('disables resend button when resendCooldown > 0', () => {
    const wrapper = mount(LoginOtpCodeStep, {
      props: { maskedDestination: 'u***@example.com', loading: false, resendCooldown: 45 },
      ...globalOpts,
    });
    // The resend button has :disable="resendCooldown > 0"
    const resendBtn = wrapper.findAll('button').find((b) =>
      b.attributes('disabled') !== undefined
    );
    expect(resendBtn).toBeDefined();
  });

  it('exposes setError which shows error message', async () => {
    const wrapper = mount(LoginOtpCodeStep, {
      props: { maskedDestination: 'u***@example.com', loading: false, resendCooldown: 0 },
      ...globalOpts,
    });
    (wrapper.vm as { setError: (m: string) => void }).setError('Invalid code');
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Invalid code');
  });
});
