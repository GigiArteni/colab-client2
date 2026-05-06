import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginPasswordStep from './LoginPasswordStep.vue';

const globalOpts = {
  global: {
    stubs: {
      QForm: { template: '<form @submit.prevent="$emit(\'submit\')"><slot /></form>' },
      QInput: {
        template: '<div><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><div v-if="errorMessage" class="error">{{ errorMessage }}</div></div>',
        props: ['modelValue', 'type', 'error', 'errorMessage', 'label', 'outlined', 'autofocus'],
        emits: ['update:modelValue'],
      },
      QBtn: { template: '<button :disabled="disable || loading" v-bind="$attrs"><slot /></button>', props: ['loading', 'disable'] },
      QIcon: { template: '<span @click="$emit(\'click\')" />', emits: ['click'] },
      QBanner: { template: '<div role="alert"><slot /></div>' },
      RouterLink: { template: '<a href="#"><slot /></a>' },
    },
  },
};

describe('LoginPasswordStep', () => {
  it('renders password input', () => {
    const wrapper = mount(LoginPasswordStep, {
      props: { identifier: 'user@example.com', loading: false, storeError: null },
      ...globalOpts,
    });
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('displays identifier in badge', () => {
    const wrapper = mount(LoginPasswordStep, {
      props: { identifier: 'user@example.com', loading: false, storeError: null },
      ...globalOpts,
    });
    expect(wrapper.text()).toContain('user@example.com');
  });

  it('emits back when identifier badge is clicked', async () => {
    const wrapper = mount(LoginPasswordStep, {
      props: { identifier: 'user@example.com', loading: false, storeError: null },
      ...globalOpts,
    });
    await wrapper.find('.identifier-badge').trigger('click');
    expect(wrapper.emitted('back')).toBeTruthy();
  });

  it('emits submit with password when handleSubmit called', async () => {
    const wrapper = mount(LoginPasswordStep, {
      props: { identifier: 'user@example.com', loading: false, storeError: null },
      ...globalOpts,
    });
    await wrapper.find('input').setValue('secret123');
    (wrapper.vm as { handleSubmit: () => void }).handleSubmit();
    expect(wrapper.emitted('submit')?.[0]).toEqual(['secret123']);
  });

  it('does not emit submit when password is empty', () => {
    const wrapper = mount(LoginPasswordStep, {
      props: { identifier: 'user@example.com', loading: false, storeError: null },
      ...globalOpts,
    });
    (wrapper.vm as { handleSubmit: () => void }).handleSubmit();
    expect(wrapper.emitted('submit')).toBeFalsy();
  });
});
