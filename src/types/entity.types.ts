/**
 * Entity Types
 * Customer's utility companies/suppliers
 */

export interface Entity {
  id: string;
  object?: string;
  group?: string; // 'account', 'customer', etc.
  type?: string; // 'company', 'individual', etc.
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  slug?: string;
  logo?: EntityLogo | null;
  parent_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EntityLogo {
  url: string;
  thumb?: string;
  key?: string;
  ext?: string;
  mime?: string;
  size?: number;
}

// Utility group types used in subscriptions/invoices
export type UtilityGroup = 'natural-gas' | 'electricity' | 'water' | 'sewage';

export interface EntitySettings {
  currency?: string;
  locale?: string;
  timezone?: string;
  payment_enabled?: boolean;
  stripe_enabled?: boolean;
}
