<template>
  <q-page padding>
    <!-- Back Button -->
    <q-btn flat color="grey" icon="las la-arrow-left" :label="$t('common.back')" @click="router.back()" class="q-mb-md" />

    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <!-- Loading -->
        <div v-if="isLoading" class="flex flex-center q-pa-xl">
          <q-spinner-dots size="50px" color="primary" />
        </div>

        <!-- Error -->
        <q-card v-else-if="error" flat bordered>
          <q-card-section class="text-center text-negative q-pa-xl">
            <q-icon name="las la-exclamation-circle" size="64px" class="q-mb-md" />
            <div class="text-h6">{{ $t('payment.error') }}</div>
            <div class="text-body2 q-mt-sm">{{ error }}</div>
            <q-btn color="primary" class="q-mt-md" :label="$t('common.tryAgain')" @click="initPayment" />
          </q-card-section>
        </q-card>

        <!-- Checkout -->
        <template v-else-if="invoice">
          <!-- Invoice Summary -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6">{{ $t('payment.payInvoice') }}</div>
              <div class="text-caption text-grey">{{ $t('invoices.invoice') }} #{{ invoice.number }}</div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="row justify-between items-center">
                <div>
                  <div class="text-body2">{{ $t('payment.amount') }}</div>
                </div>
                <div class="text-h5 text-primary">{{ formatCurrency(balanceDue) }}</div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Stripe Elements -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">{{ $t('payment.cardDetails') }}</div>

              <!-- Card Element Container -->
              <div id="card-element" class="stripe-element q-pa-md" />

              <div v-if="cardError" class="text-negative text-caption q-mt-sm">
                {{ cardError }}
              </div>
            </q-card-section>
          </q-card>

          <!-- Pay Button -->
          <q-btn
            color="primary"
            class="full-width"
            size="lg"
            :loading="isProcessing"
            :disable="isProcessing"
            @click="handlePayment"
          >
            <q-icon name="las la-lock" left />
            {{ $t('payment.payNow', { amount: formatCurrency(balanceDue) }) }}
          </q-btn>

          <div class="text-center q-mt-md text-caption text-grey">
            <q-icon name="las la-shield-alt" class="q-mr-xs" />
            {{ $t('payment.securePayment') }}
          </div>
        </template>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useEntityStore } from 'src/stores/entity';
import { invoiceService } from 'src/services/invoice.service';
import { paymentService } from 'src/services/payment.service';
import type { Invoice, PaymentIntent } from 'src/types';

declare global {
  interface Window {
    Stripe?: (key: string) => StripeInstance;
  }
}

interface StripeInstance {
  elements: () => StripeElements;
  confirmCardPayment: (clientSecret: string, options: { payment_method: { card: StripeCardElement } }) => Promise<StripePaymentResult>;
}

interface StripeElements {
  create: (type: string, options?: Record<string, unknown>) => StripeCardElement;
}

interface StripeCardElement {
  mount: (selector: string) => void;
  destroy: () => void;
  on: (event: string, handler: (e: StripeCardEvent) => void) => void;
}

interface StripeCardEvent {
  error?: { message: string };
}

interface StripePaymentResult {
  error?: { message: string };
  paymentIntent?: { status: string };
}

const { t } = useI18n();
const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const entityStore = useEntityStore();

const isLoading = ref(true);
const isProcessing = ref(false);
const error = ref<string | null>(null);
const cardError = ref<string | null>(null);
const invoice = ref<Invoice | null>(null);
const paymentIntent = ref<PaymentIntent | null>(null);

// Calculate balance due from total minus completed receipts
const balanceDue = computed(() => {
  if (!invoice.value) return 0;
  const total = Number(invoice.value.total_payable) || 0;
  const paidAmount = invoice.value.receipts
    ?.filter(r => r.is_completed)
    .reduce((sum, r) => sum + Number(r.amount), 0) || 0;
  return Math.max(0, total - paidAmount);
});

let stripe: StripeInstance | null = null;
let cardElement: StripeCardElement | null = null;

async function loadStripe(): Promise<void> {
  if (window.Stripe) return;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Stripe'));
    document.head.appendChild(script);
  });
}

async function initPayment(): Promise<void> {
  if (!entityStore.selectedEntityId) return;

  const invoiceId = route.params.id as string;
  if (!invoiceId) return;

  isLoading.value = true;
  error.value = null;

  try {
    // Load invoice with receipts to calculate balance
    invoice.value = await invoiceService.getInvoice(entityStore.selectedEntityId, invoiceId);

    if (!invoice.value) {
      error.value = t('payment.initError');
      return;
    }

    // Check if already paid (balanceDue is computed, but we need to calculate here since it's async)
    const total = Number(invoice.value.total_payable) || 0;
    const paidAmount = invoice.value.receipts
      ?.filter(r => r.is_completed)
      .reduce((sum, r) => sum + Number(r.amount), 0) || 0;
    if (total - paidAmount <= 0) {
      error.value = t('payment.alreadyPaid');
      return;
    }

    // Get payment config
    const config = await paymentService.getPaymentConfig(entityStore.selectedEntityId);

    // Check if Stripe is enabled
    const stripeKey = config.gateways?.stripe?.publishable_key;
    if (!stripeKey) {
      throw new Error('Stripe payments not configured');
    }

    // Load Stripe
    await loadStripe();

    if (!window.Stripe) {
      throw new Error('Stripe not loaded');
    }

    stripe = window.Stripe(stripeKey);

    // Create payment intent
    paymentIntent.value = await paymentService.createPaymentIntent(
      entityStore.selectedEntityId,
      invoiceId
    );

    // Mount card element
    const elements = stripe.elements();
    cardElement = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': { color: '#aab7c4' },
        },
        invalid: { color: '#c10015' },
      },
    });

    // Wait for DOM
    setTimeout(() => {
      cardElement?.mount('#card-element');
      cardElement?.on('change', (event) => {
        cardError.value = event.error?.message || null;
      });
    }, 100);
  } catch (err) {
    console.error('Failed to initialize payment:', err);
    error.value = err instanceof Error ? err.message : t('payment.initError');
  } finally {
    isLoading.value = false;
  }
}

async function handlePayment(): Promise<void> {
  if (!stripe || !cardElement || !paymentIntent.value) return;

  isProcessing.value = true;
  cardError.value = null;

  try {
    const result = await stripe.confirmCardPayment(paymentIntent.value.client_secret, {
      payment_method: { card: cardElement },
    });

    if (result.error) {
      cardError.value = result.error.message || t('payment.failed');
    } else if (result.paymentIntent?.status === 'succeeded') {
      $q.notify({
        type: 'positive',
        message: t('payment.success'),
      });
      void router.push(`/payments/success?receipt=${paymentIntent.value.receipt_id}`);
    }
  } catch (err) {
    console.error('Payment failed:', err);
    cardError.value = err instanceof Error ? err.message : t('payment.failed');
  } finally {
    isProcessing.value = false;
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: invoice.value?.currency || 'RON',
  }).format(amount);
}

onMounted(() => {
  void initPayment();
});

onUnmounted(() => {
  cardElement?.destroy();
});
</script>

<style lang="sass" scoped>
.stripe-element
  border: 1px solid #ccc
  border-radius: 4px
  background: white
  min-height: 44px
</style>
