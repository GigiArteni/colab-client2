/**
 * Payment Service
 * Stripe checkout and payment processing
 */

import { api } from 'src/boot/axios';
import type { PaymentIntent, PaymentConfig, CheckoutStatus } from 'src/types';

export const paymentService = {
  /**
   * Get payment configuration (Stripe publishable key, etc.)
   */
  async getPaymentConfig(entityId: string): Promise<PaymentConfig> {
    const response = await api.get<{ data: PaymentConfig }>(
      `/entities/${entityId}/payment-config`
    );
    return response.data.data;
  },

  /**
   * Create payment intent for an invoice
   */
  async createPaymentIntent(entityId: string, invoiceId: string): Promise<PaymentIntent> {
    const response = await api.post<{ data: PaymentIntent }>(
      `/entities/${entityId}/invoices/${invoiceId}/payment-intent`
    );
    return response.data.data;
  },

  /**
   * Get checkout status
   */
  async getCheckoutStatus(
    entityId: string,
    invoiceId: string,
    receiptId: string
  ): Promise<CheckoutStatus> {
    const response = await api.get<{ data: CheckoutStatus }>(
      `/entities/${entityId}/invoices/${invoiceId}/checkout/${receiptId}/status`
    );
    return response.data.data;
  },
};
