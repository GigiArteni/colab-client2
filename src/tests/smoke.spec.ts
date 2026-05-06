import { describe, it, expect } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';

describe('smoke', () => {
  it('mounts a Vue component', () => {
    const Comp = defineComponent({ render: () => h('div', 'hello') });
    const wrapper = mount(Comp);
    expect(wrapper.text()).toBe('hello');
  });
});
