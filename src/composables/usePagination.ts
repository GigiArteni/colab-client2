/**
 * usePagination
 * Pagination state + navigation helpers. Integrates with QTable's pagination prop
 * and the PaginationMeta shape returned by the BE.
 */

import { ref, computed, type Ref, type ComputedRef } from 'vue';
import type { PaginationMeta } from 'src/types';

export interface UsePaginationOptions {
  /** Initial page (default: 1) */
  initialPage?: number;
  /** Initial per-page size (default: 15) */
  initialPerPage?: number;
  /** Called whenever page or perPage changes */
  onChange?: (page: number, perPage: number) => void;
}

export interface QTablePagination {
  page: number;
  rowsPerPage: number;
  rowsNumber: number;
}

export interface UsePaginationReturn {
  page: Ref<number>;
  perPage: Ref<number>;
  total: Ref<number>;
  lastPage: Ref<number>;
  from: Ref<number>;
  to: Ref<number>;
  hasNextPage: ComputedRef<boolean>;
  hasPrevPage: ComputedRef<boolean>;
  /** Navigate to next page (no-op on last page) */
  nextPage: () => void;
  /** Navigate to previous page (no-op on first page) */
  prevPage: () => void;
  /** Navigate to a specific page (clamped to valid range) */
  goToPage: (n: number) => void;
  /** Change items per page and reset to page 1 */
  setPerPage: (n: number) => void;
  /** Update state from a BE PaginationMeta object */
  setMeta: (meta: PaginationMeta) => void;
  /** QTable-compatible pagination object (two-way bindable) */
  qTablePagination: ComputedRef<QTablePagination>;
  /** Handler for QTable @request event */
  onQTableRequest: (props: { pagination: QTablePagination }) => void;
}

/**
 * Manages pagination state and integrates with Quasar QTable.
 *
 * @example
 * const { page, perPage, setMeta, qTablePagination, onQTableRequest } = usePagination({
 *   onChange: (p, pp) => fetchInvoices(p, pp),
 * });
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const page = ref(options.initialPage ?? 1);
  const perPage = ref(options.initialPerPage ?? 15);
  const total = ref(0);
  const lastPage = ref(1);
  const from = ref(0);
  const to = ref(0);

  const hasNextPage = computed(() => page.value < lastPage.value);
  const hasPrevPage = computed(() => page.value > 1);

  function emit(): void {
    options.onChange?.(page.value, perPage.value);
  }

  function goToPage(n: number): void {
    const clamped = Math.max(1, Math.min(n, lastPage.value));
    if (clamped === page.value) return;
    page.value = clamped;
    emit();
  }

  function nextPage(): void {
    if (hasNextPage.value) goToPage(page.value + 1);
  }

  function prevPage(): void {
    if (hasPrevPage.value) goToPage(page.value - 1);
  }

  function setPerPage(n: number): void {
    perPage.value = n;
    page.value = 1;
    emit();
  }

  function setMeta(meta: PaginationMeta): void {
    total.value = meta.total;
    lastPage.value = meta.last_page;
    from.value = meta.from;
    to.value = meta.to;
    // Sync page in case BE clamped it
    page.value = meta.current_page;
    perPage.value = meta.per_page;
  }

  const qTablePagination = computed<QTablePagination>(() => ({
    page: page.value,
    rowsPerPage: perPage.value,
    rowsNumber: total.value,
  }));

  function onQTableRequest(props: { pagination: QTablePagination }): void {
    const { page: newPage, rowsPerPage } = props.pagination;
    if (rowsPerPage !== perPage.value) {
      perPage.value = rowsPerPage;
      page.value = 1;
    } else {
      page.value = newPage;
    }
    emit();
  }

  return {
    page,
    perPage,
    total,
    lastPage,
    from,
    to,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage,
    setPerPage,
    setMeta,
    qTablePagination,
    onQTableRequest,
  };
}
