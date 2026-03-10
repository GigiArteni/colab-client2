/**
 * Usage/Consumption Types
 * Meter readings and consumption data
 */

export interface UsageRecord {
  id: string;
  subscription_id: string;
  meter_id?: string;
  reading_start_date: string;
  reading_end_date: string;
  reading_date?: string;
  reading_type?: string;
  previous_reading?: number;
  current_reading?: number;
  consumption?: number;
  unit?: string;
  created_at: string;
  updated_at: string;
}

export interface UsageChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface UsageFilters {
  period?: 'last_6_months' | 'last_12_months' | 'last_24_months' | 'all';
  meter_id?: string;
}
