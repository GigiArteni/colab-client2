/**
 * API Service - Axios instance with interceptors for auth
 */

import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from 'src/stores/auth';
import type { ApiError } from 'src/types';

// NOTE: this project currently has TWO axios instances (this one and
// `src/boot/axios.ts`). Both now share the SAME env-var source
// (`process.env.API_URL`) so baseURL matches across imports.
// Follow-up: consolidate to one canonical instance — this one has better
// queue-based refresh-token handling and should win.
const api: AxiosInstance = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:8002/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

// Request queue for 401 handling
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore();

    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(new Error(error.message));
  }
);

// Response interceptor - handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err: Error) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const authStore = useAuthStore();
        const newToken = await authStore.refreshAccessToken();

        if (newToken) {
          processQueue(null, newToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          return api(originalRequest);
        } else {
          // Refresh failed, logout
          processQueue(new Error('Token refresh failed'), null);
          await authStore.logout();
          return Promise.reject(new Error('Token refresh failed'));
        }
      } catch (refreshError) {
        const err = refreshError instanceof Error ? refreshError : new Error('Token refresh failed');
        processQueue(err, null);
        const authStore = useAuthStore();
        await authStore.logout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Helper to extract error message from API response.
// Pass `t` from `useI18n()` to get translated messages for `message_key` errors.
export function getErrorMessage(
  error: unknown,
  t?: (key: string) => string,
): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined;

    if (apiError?.message_key && t) {
      const i18nKey = `tenancyError.${apiError.message_key}`;
      const translated = t(i18nKey);
      // vue-i18n returns the key itself when translation is missing
      if (translated !== i18nKey) {
        return translated;
      }
    }

    if (apiError?.message) {
      return apiError.message;
    }

    if (apiError?.errors) {
      const firstError = Object.values(apiError.errors)[0];
      if (Array.isArray(firstError) && firstError.length > 0 && firstError[0]) {
        return firstError[0];
      }
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
