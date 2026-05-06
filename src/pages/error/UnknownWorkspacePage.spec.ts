/**
 * UnknownWorkspacePage — renders the configured reason and exposes a CTA
 * back to the apex domain.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createMemoryHistory, createRouter } from 'vue-router';

import UnknownWorkspacePage from './UnknownWorkspacePage.vue';

const enUS = {
  tenancyError: {
    tenant_inactive: 'Inactive workspace.',
    unknown_workspace_page: {
      title: 'Workspace not available',
      description: 'Generic description.',
      cta: 'Back to main site',
    },
  },
};

const QIconStub = { name: 'QIcon', template: '<i class="q-icon-stub"></i>' };
const QBtnStub = {
  name: 'QBtn',
  props: ['label'],
  emits: ['click'],
  template: '<button @click="$emit(\'click\')">{{ label }}</button>',
};

async function renderPage(query: Record<string, string> = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/auth/unknown-workspace', component: UnknownWorkspacePage }],
  });
  await router.push({ path: '/auth/unknown-workspace', query });
  await router.isReady();

  const i18n = createI18n({ legacy: false, locale: 'en-US', messages: { 'en-US': enUS } });

  return mount(UnknownWorkspacePage, {
    global: {
      plugins: [router, i18n],
      stubs: { QIcon: QIconStub, QBtn: QBtnStub },
    },
  });
}

describe('UnknownWorkspacePage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the title', async () => {
    const wrapper = await renderPage();
    expect(wrapper.text()).toContain('Workspace not available');
  });

  it('shows the specific reason when provided as ?reason=', async () => {
    const wrapper = await renderPage({ reason: 'tenant_inactive' });
    expect(wrapper.text()).toContain('Inactive workspace.');
  });

  it('falls back to the generic description when reason is unknown', async () => {
    const wrapper = await renderPage({ reason: 'tenant_unknown' });
    expect(wrapper.text()).toContain('Generic description.');
  });

  it('CTA navigates to apex by stripping the first hostname segment', async () => {
    const hrefSetter = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        protocol: 'http:',
        hostname: 'acme.colab-client.app',
        port: '',
        get href() {
          return '';
        },
        set href(v: string) {
          hrefSetter(v);
        },
      },
      writable: true,
    });

    const wrapper = await renderPage();
    await wrapper.find('button').trigger('click');
    expect(hrefSetter).toHaveBeenCalledWith('http://colab-client.app/');
  });
});
