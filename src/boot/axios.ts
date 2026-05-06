/**
 * Axios Boot File
 * Configures API client with authentication interceptors
 */

import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { LocalStorage } from 'quasar';
import { useTenant } from 'src/composables/useTenant';

interface TenancyErrorPayload {
  message?: string;
  message_key?: string;
}

const TENANT_MISMATCH_KEYS = new Set([
  'tenant_unknown',
  'tenant_inactive',
  'tenant_archived',
]);

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// API base URL from environment or default
const API_URL = process.env.API_URL || 'http://localhost:8002/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = LocalStorage.getItem<string>('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: Error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Workspace mismatch — invalidate cached lookup and bounce to the
    // unknown-workspace landing. Triggered by BE returning 503
    // (tenant_inactive/archived) or 404 (tenant_unknown) mid-session. The
    // slug stays bound to the hostname; only the cached lookup is cleared.
    // Skip the public workspace lookup itself to avoid a guard loop.
    const status = error.response?.status;
    const payload = error.response?.data as TenancyErrorPayload | undefined;
    const messageKey = payload?.message_key;
    const isWorkspaceLookup = originalRequest?.url?.includes('/workspaces/') ?? false;

    if (
      messageKey &&
      TENANT_MISMATCH_KEYS.has(messageKey) &&
      (status === 404 || status === 503) &&
      !isWorkspaceLookup
    ) {
      const tenant = useTenant();
      tenant.invalidate();
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.includes('/auth/unknown-workspace')
      ) {
        window.location.href = `/auth/unknown-workspace?reason=${encodeURIComponent(messageKey)}`;
      }
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && originalRequest) {
      // Try to refresh token
      const refreshToken = LocalStorage.getItem<string>('refresh_token');

      if (refreshToken && !originalRequest.url?.includes('/login')) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = response.data as { access_token: string; refresh_token: string };
          LocalStorage.set('access_token', access_token);
          LocalStorage.set('refresh_token', refresh_token);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch {
          // Refresh failed - clear tokens and redirect to login
          LocalStorage.remove('access_token');
          LocalStorage.remove('refresh_token');
          window.location.href = '/auth/login';
        }
      } else {
        // No refresh token - redirect to login
        LocalStorage.remove('access_token');
        LocalStorage.remove('refresh_token');
        if (!window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
