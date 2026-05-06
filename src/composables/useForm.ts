/**
 * useForm
 * Form state, per-field validation rules, submit lifecycle, and server-side
 * 422 error mapping. Compatible with Quasar QInput :rules prop.
 */

import { reactive, ref, type Ref } from 'vue';
import type { ApiError } from 'src/types';

export type ValidationRule<T = unknown> = (value: T) => true | string;

export type FieldRules<M extends object> = {
  [K in keyof M]?: ValidationRule<M[K]>[];
};

export interface UseFormOptions<M extends object> {
  /** Initial model values */
  initialValues: M;
  /** Per-field Quasar-compatible validation rules */
  rules?: FieldRules<M>;
  /** Called after successful submit handler — resets dirty state */
  onSuccess?: () => void;
}

export interface UseFormReturn<M extends object> {
  /** Reactive form model — bind directly to v-model */
  model: M;
  /** Per-field server-side error strings (cleared on next submit) */
  errors: Record<string, string>;
  /** True while submit handler is running */
  loading: Ref<boolean>;
  /** Last top-level error message from server */
  serverError: Ref<string | null>;
  /**
   * Quasar-compatible rules getter.
   * Usage: `:rules="formRules('email')"`
   */
  formRules: <K extends keyof M>(field: K) => ValidationRule<M[K]>[];
  /**
   * Run client-side validation for all fields with rules.
   * Returns true if all pass.
   */
  validate: () => boolean;
  /**
   * Wrap an async submit handler. Handles loading flag,
   * clears old errors, maps 422 → field errors.
   */
  submit: (handler: (model: M) => Promise<void>) => Promise<void>;
  /** Reset model to initialValues and clear all errors */
  reset: () => void;
  /** Map a BE 422 ApiError to per-field errors */
  setServerErrors: (apiError: ApiError) => void;
}

/**
 * Form state + validation composable.
 *
 * @example
 * const { model, errors, formRules, submit, loading } = useForm({
 *   initialValues: { email: '', password: '' },
 *   rules: {
 *     email: [(v) => !!v || 'Required', (v) => /.+@.+/.test(v) || 'Invalid email'],
 *     password: [(v) => !!v || 'Required'],
 *   },
 * });
 */
export function useForm<M extends object>(options: UseFormOptions<M>): UseFormReturn<M> {
  const model = reactive<M>({ ...options.initialValues }) as M;
  const errors = reactive<Record<string, string>>({});
  const loading = ref(false);
  const serverError = ref<string | null>(null);

  function formRules<K extends keyof M>(field: K): ValidationRule<M[K]>[] {
    return options.rules?.[field] ?? [];
  }

  function validate(): boolean {
    if (!options.rules) return true;
    let valid = true;
    for (const field of Object.keys(options.rules) as (keyof M)[]) {
      const rules = options.rules[field];
      if (!rules) continue;
      for (const rule of rules) {
        const result = rule(model[field]);
        if (result !== true) {
          errors[field as string] = result;
          valid = false;
          break;
        } else {
          delete errors[field as string];
        }
      }
    }
    return valid;
  }

  function setServerErrors(apiError: ApiError): void {
    serverError.value = apiError.message ?? null;
    if (apiError.errors) {
      for (const [field, messages] of Object.entries(apiError.errors)) {
        errors[field] = Array.isArray(messages) ? (messages[0] ?? '') : messages;
      }
    }
  }

  async function submit(handler: (model: M) => Promise<void>): Promise<void> {
    // Clear previous errors
    for (const key of Object.keys(errors)) delete errors[key];
    serverError.value = null;

    if (!validate()) return;

    loading.value = true;
    try {
      await handler(model);
      options.onSuccess?.();
    } catch (err: unknown) {
      // Map axios 422 validation errors to field errors
      const axiosErr = err as { response?: { status: number; data: ApiError } };
      if (axiosErr?.response?.status === 422 && axiosErr.response.data) {
        setServerErrors(axiosErr.response.data);
      } else if (axiosErr?.response?.data?.message) {
        serverError.value = axiosErr.response.data.message;
      } else if (err instanceof Error) {
        serverError.value = err.message;
      }
    } finally {
      loading.value = false;
    }
  }

  function reset(): void {
    for (const key of Object.keys(errors)) delete errors[key];
    serverError.value = null;
    Object.assign(model, options.initialValues);
  }

  return {
    model,
    errors,
    loading,
    serverError,
    formRules,
    validate,
    submit,
    reset,
    setServerErrors,
  };
}
