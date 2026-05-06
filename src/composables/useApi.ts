/**
 * useApi
 * Component-level fetch lifecycle for one-off API calls where a store is overkill.
 * Wraps any async function with loading/error/data state + auto-cancel on unmount.
 */

import { ref, onUnmounted, type Ref } from 'vue';

export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseApiOptions<T> {
  /** Execute immediately on creation */
  immediate?: boolean;
  /** Poll interval in ms. Omit to disable polling. */
  pollingInterval?: number;
  /** Called on success */
  onSuccess?: (data: T) => void;
  /** Called on error */
  onError?: (error: Error) => void;
}

export interface UseApiReturn<T> {
  data: Ref<T | null>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  status: Ref<ApiStatus>;
  /** Run the request. Cancels any in-flight request first. */
  execute: () => Promise<void>;
  /** Alias for execute — re-runs the last request */
  retry: () => Promise<void>;
  /** Abort any in-flight request */
  abort: () => void;
}

/**
 * Generic fetch lifecycle composable.
 *
 * @example
 * const { data, loading, error, execute } = useApi(
 *   () => invoiceService.getInvoice(entityId, invoiceId)
 * );
 * onMounted(() => execute());
 */
export function useApi<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>;
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const status = ref<ApiStatus>('idle');

  let controller: AbortController | null = null;
  let pollTimer: ReturnType<typeof setTimeout> | null = null;

  function abort(): void {
    if (controller) {
      controller.abort();
      controller = null;
    }
    if (pollTimer !== null) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
  }

  async function execute(): Promise<void> {
    abort();

    controller = new AbortController();
    loading.value = true;
    error.value = null;
    status.value = 'loading';

    try {
      const result = await fn(controller.signal);
      data.value = result;
      status.value = 'success';
      options.onSuccess?.(result);
    } catch (err) {
      // Ignore abort errors — they are intentional
      if (err instanceof Error && err.name === 'AbortError') {
        status.value = 'idle';
        return;
      }
      const wrapped = err instanceof Error ? err : new Error(String(err));
      error.value = wrapped;
      status.value = 'error';
      options.onError?.(wrapped);
    } finally {
      loading.value = false;

      // Schedule next poll if requested
      if (options.pollingInterval && options.pollingInterval > 0) {
        pollTimer = setTimeout(() => {
          void execute();
        }, options.pollingInterval);
      }
    }
  }

  const retry = execute;

  // Clean up on component unmount
  onUnmounted(() => {
    abort();
  });

  if (options.immediate) {
    void execute();
  }

  return { data, loading, error, status, execute, retry, abort };
}
