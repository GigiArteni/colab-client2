/**
 * Alert Types for Customer Portal
 */

export interface Alert {
  id: string;
  uuid: string;
  entity_id: string;
  alert_type_id: string;
  alert_type?: AlertType;
  alertable_type: string;
  alertable_id: string;
  alertable?: any;
  recipient_type: string;
  recipient_id: string;
  recipient?: any;
  channel: 'email' | 'sms' | 'whatsapp' | 'print' | 'in_app';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  subject: string;
  content_rendered?: string;
  status: 'pending' | 'queued' | 'processing' | 'sending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  created_at: string;
  sent_at?: string;
  delivered_at?: string;
  dismissed_at?: string;
  dismissed_by?: string;
  creator?: any;
  dismisser?: any;
}

export interface AlertType {
  id: string;
  code: string;
  category: string;
  name: string;
  description?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface AlertStats {
  total: number;
  unread: number;
  by_priority: {
    urgent: number;
    high: number;
    normal: number;
    low: number;
  };
  by_category: Record<string, number>;
}

export interface PaginatedAlerts {
  data: Alert[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
