/**
 * NoWorkspaceLandingPage — apex landing for visitors without a workspace
 * subdomain. Renders translated title + description + optional marketing CTA.
 */

import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import NoWorkspaceLandingPage from './NoWorkspaceLandingPage.vue';

const enUS = {
  tenancyError: {
    no_workspace_landing: {
      title: 'You\'re on the main site',
      description: 'Use the personalised link from your provider.',
      example: 'Example: yourprovider.colab-client.app',
      cta: 'Visit our website',
    },
  },
};

const QIconStub = { name: 'QIcon', template: '<i class="q-icon-stub"></i>' };
const QBannerStub = { name: 'QBanner', template: '<div class="q-banner-stub"><slot /></div>' };
const QBtnStub = {
  name: 'QBtn',
  props: ['label', 'href'],
  template: '<a :href="href">{{ label }}</a>',
};

function render() {
  const i18n = createI18n({ legacy: false, locale: 'en-US', messages: { 'en-US': enUS } });

  return mount(NoWorkspaceLandingPage, {
    global: {
      plugins: [i18n],
      stubs: { QIcon: QIconStub, QBanner: QBannerStub, QBtn: QBtnStub },
    },
  });
}

describe('NoWorkspaceLandingPage', () => {
  it('renders the title and description', () => {
    const wrapper = render();
    expect(wrapper.text()).toContain('You\'re on the main site');
    expect(wrapper.text()).toContain('Use the personalised link from your provider.');
  });

  it('renders the subdomain example', () => {
    const wrapper = render();
    expect(wrapper.text()).toContain('yourprovider.colab-client.app');
  });

  it('does not render the CTA when MARKETING_URL env is unset', () => {
    const wrapper = render();
    expect(wrapper.find('a').exists()).toBe(false);
  });
});
