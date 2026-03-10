/**
 * Invoice Types
 * Customer invoices and receipts
 */

import type { Subscription, DiscussionMeta } from './subscription.types';
import type { UtilityGroup } from './entity.types';

export interface Invoice {
  id: string;
  object?: string;
  entity_id: string;
  invoiceable_id?: string; // subscription id
  billable_id?: string; // contact id
  group?: UtilityGroup; // 'natural-gas', 'electricity', etc.
  type?: string; // 'subscription', 'one-time', etc.
  number: string;
  fiscal_series?: string;
  status: InvoiceStatus;
  invoice_at: string; // issue date
  due_date: string;
  paid_at?: string | null;
  from_date?: string; // period start
  to_date?: string; // period end
  subtotal: string | number;
  tax_amount: string | number;
  discount_amount?: string | number;
  grand_total: string | number; // total before subsidies: subtotal + tax - discount
  subsidy_amount?: string | number;
  total_payable: string | number; // final amount to pay: grand_total - subsidy
  currency: string;
  vat_rate?: string | number;
  vat_amount?: string | number;
  vat_exempt_reason?: string | null;
  reverse_charge?: boolean;
  notes?: string | null;
  anaf_upload_required?: boolean;
  anaf_uploaded_at?: string | null;
  anaf_status?: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  subscription?: Subscription;
  items?: InvoiceItem[];
  receipts?: Receipt[];
  subsidies?: Subsidy[];
  discussion_meta?: DiscussionMeta;
  // Payment & penalty fields
  remaining_amount?: string | number;
  is_overdue?: boolean;
  total_paid?: string | number;
  payment_percentage?: number;
  penalty_info?: PenaltyInfo | null;
}

export interface PenaltyInfo {
  source_invoice_id: string;
  source_invoice_number: string;
  days: number;
  rate: number;
  periods: PenaltyPeriod[];
}

export interface PenaltyPeriod {
  start: string;
  end: string;
  days: number;
  balance: number;
  daily_amount: number;
  period_total: number;
}

export interface Subsidy {
  id: string;
  subscription_id?: string;
  group: string; // 'natural-gas' | 'electricity' | 'water'
  group_label?: string;
  type: string;
  type_label?: string;
  amount: string | number;
  calculation_mode?: string; // 'fixed' | 'percentage' | 'per_unit' | 'price_cap'
  calculation_mode_label?: string;
  percentage?: string | number;
  unit_rate?: string | number;
  max_amount_per_period?: string | number;
  interval?: string;
  unit?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  regulatory_reference?: string;
  status?: string;
  status_label?: string;
  created_at?: string;
  updated_at?: string;
}

export type InvoiceStatus = 'draft' | 'pending' | 'validated' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled' | 'refunded' | 'corrected';

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  item_name?: string;
  description?: string;
  quantity: number;
  unit?: string;
  unit_price: string | number;
  line_total?: string | number;
  amount?: string | number;
  tax_rate?: string | number;
  tax_amount?: string | number;
  // Usage details (for consumption items)
  previous_reading?: number;
  current_reading?: number;
  consumption?: number;
}

export interface Receipt {
  id: string;
  invoice_id: string;
  receipt_number?: string;
  amount: string | number;
  currency?: string;
  payment_method?: PaymentMethod;
  payment_method_label?: string;
  paid_at?: string;
  transaction_reference?: string;
  payment_gateway?: string;
  gateway_transaction_id?: string;
  status?: ReceiptStatus;
  status_label?: string;
  // Computed fields from API
  is_completed?: boolean;
  is_failed?: boolean;
  is_pending?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type PaymentMethod = 'card' | 'bank_transfer' | 'cash' | 'other';
export type ReceiptStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// API returns status counts as { status: count } object
export interface InvoiceStatusCounts {
  draft?: number;
  sent?: number;
  pending?: number;
  paid?: number;
  partially_paid?: number;
  overdue?: number;
  cancelled?: number;
  [key: string]: number | undefined;
}

// API returns comprehensive statistics
export interface InvoiceStatistics {
  total_invoices: number;
  total_amount: number;
  outstanding_amount: number;
  overdue_count: number;
  draft_count: number;
  anaf_pending_count: number;
  average_invoice_amount: number;
  status_breakdown: InvoiceStatusCounts;
  current_month: {
    total_invoiced: number;
    total_collected: number;
  };
  previous_month: {
    total_invoiced: number;
    total_collected: number;
  };
}

export interface InvoiceFilters {
  status?: InvoiceStatus | InvoiceStatus[];
  group?: UtilityGroup;
  date_preset?: 'last_month' | 'last_3_months' | 'last_6_months' | 'last_year' | 'all';
  date_from?: string;
  date_to?: string;
}
