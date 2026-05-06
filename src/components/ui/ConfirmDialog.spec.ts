import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ConfirmDialog from './ConfirmDialog.vue';

const globalOpts = {
  global: {
    stubs: {
      QDialog: { template: '<div v-if="$attrs[\'modelValue\']" class="q-dialog"><slot /></div>' },
      QCard: { template: '<div><slot /></div>' },
      QCardSection: { template: '<div><slot /></div>' },
      QCardActions: { template: '<div><slot /></div>' },
      QBtn: { template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot>{{ $attrs.label }}</slot></button>' },
    },
  },
};

describe('ConfirmDialog', () => {
  it('is closed by default', () => {
    const wrapper = mount(ConfirmDialog, { ...globalOpts });
    expect(wrapper.find('.q-dialog').exists()).toBe(false);
  });

  it('opens after confirm() call', async () => {
    const wrapper = mount(ConfirmDialog, { ...globalOpts });
    const vm = wrapper.vm as InstanceType<typeof ConfirmDialog>;
    void vm.confirm({ title: 'Delete?', message: 'Are you sure?' });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.q-dialog').exists()).toBe(true);
  });

  it('resolves true when ok clicked', async () => {
    const wrapper = mount(ConfirmDialog, { ...globalOpts });
    const vm = wrapper.vm as InstanceType<typeof ConfirmDialog>;
    const promise = vm.confirm({ title: 'Delete?', message: 'Sure?' });
    await wrapper.vm.$nextTick();
    const buttons = wrapper.findAll('button');
    await buttons[1]?.trigger('click');
    expect(await promise).toBe(true);
  });

  it('resolves false when cancel clicked', async () => {
    const wrapper = mount(ConfirmDialog, { ...globalOpts });
    const vm = wrapper.vm as InstanceType<typeof ConfirmDialog>;
    const promise = vm.confirm({ title: 'Delete?', message: 'Sure?' });
    await wrapper.vm.$nextTick();
    const buttons = wrapper.findAll('button');
    await buttons[0]?.trigger('click');
    expect(await promise).toBe(false);
  });
});
