import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginEmailStep from './LoginEmailStep.vue';

const globalOpts = {
  global: {
    stubs: {
      QForm: { template: '<form @submit.prevent><slot /></form>' },
      QInput: {
        template: '<div><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><div v-if="errorMessage" class="error">{{ errorMessage }}</div></div>',
        props: ['modelValue', 'error', 'errorMessage', 'label', 'outlined', 'autofocus'],
        emits: ['update:modelValue'],
      },
      QBtn: { template: '<button type="submit" :disabled="disable || loading" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>', props: ['loading', 'disable'], emits: ['click'] },
      QIcon: true,
      QBanner: { template: '<div role="alert"><slot /><slot name="avatar" /></div>' },
    },
  },
};

describe('LoginEmailStep', () => {
  it('renders identifier input', () => {
    const wrapper = mount(LoginEmailStep, {
      props: { loading: false, storeError: null },
      ...globalOpts,
    });
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('emits submit with identifier value when handleSubmit called', async () => {
    const wrapper = mount(LoginEmailStep, {
      props: { loading: false, storeError: null },
      ...globalOpts,
    });
    await wrapper.find('input').setValue('user@example.com');
    (wrapper.vm as { handleSubmit: () => void }).handleSubmit();
    expect(wrapper.emitted('submit')).toBeTruthy();
    expect(wrapper.emitted('submit')![0]).toEqual(['user@example.com']);
  });

  it('disables submit button when loading', () => {
    const wrapper = mount(LoginEmailStep, {
      props: { loading: true, storeError: null },
      ...globalOpts,
    });
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
  });

  it('shows store error when provided', () => {
    const wrapper = mount(LoginEmailStep, {
      props: { loading: false, storeError: 'Invalid credentials' },
      ...globalOpts,
    });
    expect(wrapper.text()).toContain('Invalid credentials');
  });
});
