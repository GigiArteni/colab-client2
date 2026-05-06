/**
 * useEmptyState
 * Derives a single display-state discriminant from loading/error/data refs.
 * Drives conditional rendering of LoadingSkeleton, ErrorBanner, EmptyState, and content.
 */

import { computed, type Ref, type ComputedRef } from 'vue';

export type DisplayState = 'loading' | 'error' | 'empty' | 'data';

export interface UseEmptyStateOptions<T> {
  /** Loading flag — typically from useApi or a store */
  loading: Ref<boolean>;
  /** Error value — non-null means an error occurred */
  error: Ref<unknown>;
  /**
   * Data value. Considered "empty" when:
   * - null or undefined
   * - an empty array
   * - an object with zero keys
   * Override with `isEmpty` to customise.
   */
  data: Ref<T | null | undefined>;
  /**
   * Optional override for empty check.
   * Return true to treat data as empty.
   */
  isEmpty?: (data: T) => boolean;
}

export interface UseEmptyStateReturn {
  isLoading: ComputedRef<boolean>;
  isError: ComputedRef<boolean>;
  isEmpty: ComputedRef<boolean>;
  hasData: ComputedRef<boolean>;
  /** Single discriminant — use in v-if chains or a switch */
  displayState: ComputedRef<DisplayState>;
}

function defaultIsEmpty<T>(data: T): boolean {
  if (data === null || data === undefined) return true;
  if (Array.isArray(data)) return data.length === 0;
  if (typeof data === 'object') return Object.keys(data as object).length === 0;
  return false;
}

/**
 * Derives display state from async data lifecycle refs.
 *
 * Priority: loading > error > empty > data
 *
 * @example
 * const { displayState } = useEmptyState({ loading, error, data: invoices });
 *
 * // template:
 * // <LoadingSkeleton v-if="displayState === 'loading'" />
 * // <ErrorBanner v-else-if="displayState === 'error'" />
 * // <EmptyState v-else-if="displayState === 'empty'" />
 * // <InvoiceList v-else />
 */
export function useEmptyState<T>(options: UseEmptyStateOptions<T>): UseEmptyStateReturn {
  const isLoading = computed(() => options.loading.value);

  const isError = computed(() => {
    if (options.loading.value) return false;
    return options.error.value !== null && options.error.value !== undefined;
  });

  const isEmpty = computed(() => {
    if (options.loading.value || isError.value) return false;
    const d = options.data.value;
    if (d === null || d === undefined) return true;
    return options.isEmpty ? options.isEmpty(d) : defaultIsEmpty(d);
  });

  const hasData = computed(() => !isLoading.value && !isError.value && !isEmpty.value);

  const displayState = computed<DisplayState>(() => {
    if (isLoading.value) return 'loading';
    if (isError.value) return 'error';
    if (isEmpty.value) return 'empty';
    return 'data';
  });

  return { isLoading, isError, isEmpty, hasData, displayState };
}
