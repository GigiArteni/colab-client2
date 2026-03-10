/**
 * Payment Types
 * Stripe checkout and payment processing
 */

export interface PaymentIntent {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  receipt_id: string;
}

export interface PaymentGatewayConfig {
  gateway: string;
  gateway_label: string;
  publishable_key: string;
  supported_currencies: string[];
}

export interface PaymentConfig {
  online_payments_enabled: boolean;
  gateways?: {
    stripe?: PaymentGatewayConfig;
    [key: string]: PaymentGatewayConfig | undefined;
  };
}

export interface CheckoutStatus {
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  receipt_id: string;
  invoice_id: string;
  amount: number;
  currency: string;
  error_message?: string;
}
