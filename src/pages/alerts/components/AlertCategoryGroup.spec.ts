import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AlertCategoryGroup from './AlertCategoryGroup.vue';

const globalOpts = {
  global: {
    stubs: {
      QBtn: {
        template: '<button @click="$emit(\'click\')"><slot /></button>',
        emits: ['click'],
      },
      QCard: { template: '<div class="alert-type-card"><slot /></div>' },
      QCardSection: { template: '<div class="q-card-section"><slot /></div>' },
      QSeparator: true,
      QBadge: { template: '<span class="q-badge"><slot /></span>', props: ['color', 'label', 'size'] },
      QChip: { template: '<span class="q-chip"><slot /></span>', props: ['color', 'textColor', 'icon', 'size'] },
      QIcon: true,
      AlertChannelToggle: { template: '<div class="alert-channel-toggle" />' },
    },
  },
};

const channels = [
  { value: 'email', label: 'Email', icon: 'las la-envelope', color: 'blue' },
];

const alertTypes = [
  { id: 'at-1', code: 'invoice_due', name: 'Invoice Due', description: '', category: 'invoice', priority: 'low' as const },
  { id: 'at-2', code: 'payment_received', name: 'Payment Received', description: '', category: 'invoice', priority: 'normal' as const },
];

describe('AlertCategoryGroup', () => {
  it('renders a card for each alert type', () => {
    const wrapper = mount(AlertCategoryGroup, {
      props: { alertTypes, channels, preferences: new Map() },
      ...globalOpts,
    });
    expect(wrapper.findAll('.alert-type-card')).toHaveLength(2);
  });

  it('shows empty state when alertTypes is empty', () => {
    const wrapper = mount(AlertCategoryGroup, {
      props: { alertTypes: [], channels, preferences: new Map() },
      ...globalOpts,
    });
    expect(wrapper.find('.empty-state').exists()).toBe(true);
  });

  it('shows Activ text when a channel is enabled', () => {
    const prefs = new Map([
      ['at-1', { email: true, sms: false, whatsapp: false, print: false, in_app: false }],
    ]);
    const wrapper = mount(AlertCategoryGroup, {
      props: { alertTypes, channels, preferences: prefs },
      ...globalOpts,
    });
    expect(wrapper.text()).toContain('Activ');
  });

  it('emits enable-all when first button clicked', async () => {
    const wrapper = mount(AlertCategoryGroup, {
      props: { alertTypes, channels, preferences: new Map() },
      ...globalOpts,
    });
    await wrapper.findAll('button')[0]!.trigger('click');
    expect(wrapper.emitted('enable-all')).toBeTruthy();
  });

  it('emits disable-all when second button clicked', async () => {
    const wrapper = mount(AlertCategoryGroup, {
      props: { alertTypes, channels, preferences: new Map() },
      ...globalOpts,
    });
    await wrapper.findAll('button')[1]!.trigger('click');
    expect(wrapper.emitted('disable-all')).toBeTruthy();
  });
});
