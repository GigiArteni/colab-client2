/**
 * Meter Types
 * Gas meter management for customer portal
 */

import type { Contact } from './auth.types';

// Meter status enum matching backend
export type MeterStatus = 'pending' | 'active' | 'detached' | 'replaced' | 'decommissioned';

// Meter type enum matching backend
export type MeterType = 'traditional' | 'smart' | 'volumetric' | 'thermal';

// Meter group enum matching backend
export type MeterGroup = 'natural-gas' | 'water' | 'electricity';

export interface Meter {
  id: string;
  object?: string;
  entity_id: string;
  subscription_id?: string;
  serial_number: string;
  manufacturer?: string;
  model?: string;
  seal_number?: string;
  type: MeterType;
  group: MeterGroup;
  status: MeterStatus;
  initial_index?: number;
  current_index?: number;
  previous_index?: number;
  last_reading_date?: string;
  capacity?: number;
  clc?: string;
  zone?: string;
  installed_date?: string;
  verification_date?: string;
  detached_at?: string;
  detached_reason?: string;
  detachment_notes?: string;
  created_at: string;
  updated_at: string;
  // BE shape aliases / computed fields used by some endpoints
  meter_type?: MeterType;
  last_reading?: number;
  last_reading_value?: number;
  unit?: string;
  is_active?: boolean;
  // Relations
  subscription?: {
    id: string;
    contract_no?: string;
  };
  creator?: Contact;
  updater?: Contact;
  discussion_meta?: {
    has_comments: boolean;
    comment_count: number;
    has_unread: boolean;
    unread_count: number;
  };
}

export interface MeterReading {
  id: string;
  meter_id: string;
  subscription_id: string;
  reading_start_date?: string;
  reading_end_date?: string;
  previous_index: number;
  current_index: number;
  usage_m3?: number;
  usage_kwh?: number;
  usage_mwh?: number;
  reading_source?: 'manual' | 'automatic' | 'customer' | 'estimated';
  validation_status?: 'pending' | 'validated' | 'rejected';
  anomaly_detected?: boolean;
  anomaly_type?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  creator?: Contact;
  // BE shape aliases used by some endpoints
  status?: string;
  source?: string;
  reading?: number;
  reading_date?: string;
}

export interface MeterReadingSubmission {
  current_index: number;
  reading_date?: string;
  notes?: string;
  photo_path?: string;
}

export interface MeterActivity {
  id: string;
  object?: string;
  entity_id: string;
  type: string;
  type_label: string;
  group: string;
  title: string;
  content?: string;
  data?: Record<string, unknown>;
  subject_type?: string;
  subject_id?: string;
  causer_type?: string;
  causer_id?: string;
  actionable_type?: string;
  actionable_id?: string;
  created_at: string;
  // Relations
  causer?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  subject?: Record<string, unknown>;
}

export interface MeterStatusCounts {
  pending: number;
  active: number;
  detached: number;
  replaced: number;
  decommissioned: number;
  total: number;
}

export interface MeterFilters {
  group?: MeterGroup;
  status?: MeterStatus;
  type?: MeterType;
  search?: string;
  subscription_id?: string;
}
