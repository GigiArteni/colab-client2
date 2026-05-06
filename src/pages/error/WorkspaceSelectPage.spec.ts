/**
 * Tests for UnknownWorkspacePage — the workspace resolution error path
 * (5th critical page spec in Phase 7).
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() }),
}));

import UnknownWorkspacePage from './UnknownWorkspacePage.vue';

const enUS = {
  tenancyError: {
    unknown_workspace_page: {
      title: 'Workspace not found',
      description: "The workspace you're looking for doesn't exist.",
      cta: 'Go to main site',
    },
  },
};

function render() {
  const i18n = createI18n({ legacy: false, locale: 'en-US', messages: { 'en-US': enUS } });
  return mount(UnknownWorkspacePage, {
    global: {
      plugins: [i18n],
      stubs: {
        QIcon: { template: '<i />' },
        QBtn: { props: ['label'], template: '<button>{{ label }}</button>' },
      },
    },
  });
}

describe('UnknownWorkspacePage', () => {
  it('renders the workspace not found title', () => {
    const wrapper = render();
    expect(wrapper.text()).toContain('Workspace not found');
  });

  it('renders the descriptive message', () => {
    const wrapper = render();
    expect(wrapper.text()).toContain("The workspace you're looking for doesn't exist.");
  });

  it('renders a CTA button', () => {
    const wrapper = render();
    expect(wrapper.find('button').exists()).toBe(true);
    expect(wrapper.find('button').text()).toContain('Go to main site');
  });

  it('has role=alert for accessibility', () => {
    const wrapper = render();
    expect(wrapper.find('[role="alert"]').exists()).toBe(true);
  });
});
