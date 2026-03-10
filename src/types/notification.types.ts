// Notification Types

export type NotificationType =
  | 'invoice_created'
  | 'invoice_due'
  | 'invoice_overdue'
  | 'payment_received'
  | 'reading_reminder'
  | 'reading_approved'
  | 'reading_rejected'
  | 'subscription_update'
  | 'maintenance_scheduled'
  | 'alert'
  | 'general';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: NotificationData | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationData {
  // Invoice-related
  invoice_id?: number;
  invoice_number?: string;
  amount?: number;
  due_date?: string;

  // Payment-related
  payment_id?: number;
  payment_amount?: number;

  // Reading-related
  meter_id?: number;
  reading_id?: number;
  reading_value?: number;

  // Subscription-related
  subscription_id?: number;

  // General
  url?: string;
  action?: string;
}

export interface NotificationListParams {
  page?: number;
  per_page?: number;
  'filter[read]'?: boolean;
}

export interface NotificationSummary {
  total: number;
  unread: number;
}
