import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';

vi.mock('src/boot/axios', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock('src/composables/useTenant', () => ({
  useTenant: () => ({ slug: { value: 'acme' } }),
}));

vi.mock('quasar', () => ({
  LocalStorage: { getItem: vi.fn(() => null), set: vi.fn(), remove: vi.fn() },
  useQuasar: () => ({ notify: vi.fn() }),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ query: {} }),
}));

vi.mock('src/boot/appInit', () => ({
  initializeApp: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('src/services/auth.service');
vi.mock('src/services/mfa.service');

// Stub child step components by their file paths
vi.mock('./components/LoginEmailStep.vue', () => ({
  default: { name: 'LoginEmailStep', template: '<div class="login-email-step" />' },
}));
vi.mock('./components/LoginPasswordStep.vue', () => ({
  default: { name: 'LoginPasswordStep', template: '<div class="login-password-step" />' },
}));
vi.mock('./components/LoginOtpStep.vue', () => ({
  default: { name: 'LoginOtpStep', template: '<div class="login-otp-step" />' },
}));
vi.mock('./components/LoginOtpCodeStep.vue', () => ({
  default: { name: 'LoginOtpCodeStep', template: '<div class="login-otp-code-step" />' },
}));
vi.mock('./components/LoginMfaStep.vue', () => ({
  default: { name: 'LoginMfaStep', template: '<div class="login-mfa-step" />' },
}));

import type { Component } from 'vue';
import * as LoginPageMod from './LoginPage.vue';
const LoginPage = (LoginPageMod as { default: Component }).default;

function mountLoginPage() {
  const i18n = createI18n({
    legacy: false,
    locale: 'en-US',
    messages: {
      'en-US': {
        auth: { stepOf: 'Step {current} of {total}' },
      },
    },
  });
  setActivePinia(createPinia());

  return mount(LoginPage, {
    global: {
      plugins: [i18n],
    },
  });
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders step indicator with correct aria attributes', () => {
    const wrapper = mountLoginPage();
    const indicator = wrapper.find('[role="progressbar"]');
    expect(indicator.exists()).toBe(true);
    expect(indicator.attributes('aria-valuenow')).toBe('1');
  });

  it('renders LoginEmailStep as first step', () => {
    const wrapper = mountLoginPage();
    expect(wrapper.find('.login-email-step').exists()).toBe(true);
  });

  it('does not render password or OTP steps initially', () => {
    const wrapper = mountLoginPage();
    expect(wrapper.find('.login-password-step').exists()).toBe(false);
    expect(wrapper.find('.login-otp-step').exists()).toBe(false);
  });
});
