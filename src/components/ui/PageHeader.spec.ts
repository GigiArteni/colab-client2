import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PageHeader from './PageHeader.vue';

const globalOpts = {
  global: {
    stubs: {
      QBreadcrumbs: { template: '<nav><slot /></nav>' },
      QBreadcrumbsEl: { template: '<span>{{ $attrs.label }}</span>' },
    },
  },
};

describe('PageHeader', () => {
  it('renders title', () => {
    const wrapper = mount(PageHeader, { props: { title: 'Invoices' }, ...globalOpts });
    expect(wrapper.text()).toContain('Invoices');
  });

  it('renders optional subtitle', () => {
    const wrapper = mount(PageHeader, {
      props: { title: 'Invoices', subtitle: '12 found' },
      ...globalOpts,
    });
    expect(wrapper.text()).toContain('12 found');
  });

  it('renders breadcrumbs when provided', () => {
    const wrapper = mount(PageHeader, {
      props: { title: 'Detail', breadcrumbs: [{ label: 'Home', to: '/' }, { label: 'Detail' }] },
      ...globalOpts,
    });
    expect(wrapper.text()).toContain('Home');
  });

  it('renders default slot for actions', () => {
    const wrapper = mount(PageHeader, {
      props: { title: 'Page' },
      slots: { default: '<button>New</button>' },
      ...globalOpts,
    });
    expect(wrapper.text()).toContain('New');
  });
});
