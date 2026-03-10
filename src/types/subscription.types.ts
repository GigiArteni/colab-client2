/**
 * Subscription Types
 * Customer's utility subscriptions (contracts)
 */

import type { UtilityGroup, Entity } from './entity.types';
import type { Contact } from './auth.types';

export interface Subscription {
  id: string;
  object?: string;
  entity_id: string;
  subscriptionable_id?: string;
  group: UtilityGroup; // 'natural-gas', 'electricity', etc.
  type?: string; // 'residential', 'commercial', etc.
  contract_no?: string;
  project_no?: string;
  plan_id?: string;
  supplier_id?: string;
  pcs_location_id?: string;
  is_active: boolean;
  has_new_supplier?: boolean;
  has_vat_inclusive?: boolean;
  has_excise?: boolean;
  has_account?: boolean;
  supply_point_code?: string | null;
  pressure_level?: string | null;
  connection_date?: string | null;
  activated_at?: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  entity?: Entity;
  contact?: Contact;
  address?: Location;
  lastUsage?: Usage;
  plan?: Plan;
  discussion_meta?: DiscussionMeta;
}

export interface Location {
  id: string;
  object?: string;
  group?: string;
  type?: string;
  full_address?: string;
  address1?: string;
  address2?: string;
  country?: string;
  postal_code?: string;
  region?: string;
  locality?: string; // city
  place_id?: string;
  latitude?: string;
  longitude?: string;
}

export interface Plan {
  id: string;
  name: string;
  code?: string;
  group?: string;
}

export interface DiscussionMeta {
  has_comments: boolean;
  comment_count: number;
  has_unread: boolean;
  unread_count: number;
}

// Meter interface moved to meter.types.ts

export interface Usage {
  id: string;
  subscription_id?: string;
  meter_id?: string;
  reading_start_date?: string;
  reading_end_date?: string;
  reading_date?: string;
  reading_type?: string;
  previous_reading?: number;
  current_reading?: number;
  consumption?: number;
  unit?: string;
  created_at?: string;
}

export interface UsageStatistics {
  total_consumption: number;
  average_monthly: number;
  last_12_months: MonthlyUsage[];
  unit: string;
}

export interface MonthlyUsage {
  month: string;
  year: number;
  consumption: number;
}

export interface FinancialStatistics {
  total_invoiced: number;
  total_paid: number;
  balance_due: number;
  currency: string;
}
