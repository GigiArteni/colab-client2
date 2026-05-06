import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';

vi.mock('src/boot/axios', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock('quasar', () => ({
  LocalStorage: { getItem: vi.fn(() => null), set: vi.fn(), remove: vi.fn() },
  useQuasar: () => ({ notify: vi.fn() }),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useRoute: () => ({
    params: { entityId: 'e1', subscriptionId: 's1', invoiceId: 'inv1' },
  }),
}));

vi.mock('src/services/payment.service');
vi.mock('src/services/invoice.service');

import CheckoutPage from './CheckoutPage.vue';

const i18nMessages = {
  'en-US': {
    common: { back: 'Back', tryAgain: 'Try Again' },
    payment: {
      error: 'Payment Error',
      payInvoice: 'Pay Invoice',
      amount: 'Amount',
      cardDetails: 'Card Details',
      pay: 'Pay',
      processing: 'Processing',
    },
    invoices: { invoice: 'Invoice' },
  },
};

const QuasarStub = { template: '<div><slot /></div>' };
const QuasarBtnStub = { props: ['label'], template: '<button>{{ label }}</button>' };

function mountPage() {
  const i18n = createI18n({ legacy: false, locale: 'en-US', messages: i18nMessages });
  setActivePinia(createPinia());

  return mount(CheckoutPage, {
    global: {
      plugins: [i18n],
      stubs: {
        QPage: QuasarStub,
        QBtn: QuasarBtnStub,
        QCard: QuasarStub,
        QCardSection: QuasarStub,
        QSeparator: { template: '<hr />' },
        QSpinnerDots: { template: '<div class="spinner" />' },
        QIcon: { template: '<i />' },
      },
    },
  });
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spinner on mount', () => {
    const wrapper = mountPage();
    expect(wrapper.find('.spinner').exists()).toBe(true);
  });

  it('renders the page', () => {
    const wrapper = mountPage();
    expect(wrapper.exists()).toBe(true);
  });
});
