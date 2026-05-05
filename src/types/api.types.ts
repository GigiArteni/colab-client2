/**
 * API Response Types
 * Standard API response wrappers
 */

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links?: PaginationLinks;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginationLinks {
  first?: string;
  last?: string;
  prev?: string;
  next?: string;
}

export interface ApiError {
  message: string;
  message_key?: string;
  errors?: Record<string, string[]>;
  status?: number;
}
