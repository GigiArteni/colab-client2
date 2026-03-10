# Customer Utilities Mobile App - Implementation Plan

## Project Overview

**Project Name:** CoLab Customer Portal
**Platform:** PWA (Progressive Web App) + Capacitor (iOS/Android)
**Tech Stack:** Vue 3 + Quasar Framework + TypeScript + Pinia
**Backend API:** colab-api2 (Laravel Apiato + Passport OAuth2)

---

## Executive Summary

This document outlines the implementation plan for a customer-facing mobile application that allows utility customers to:
- View and pay invoices
- Track consumption/usage data
- Manage subscriptions and services
- Receive alerts and notifications
- Communicate with service providers
- Access documents and reports

The app will be installable as a PWA and exportable to iOS/Android via Capacitor.

---

## Phase 1: Foundation & Authentication (Priority: Critical)

### 1.1 Project Configuration

**Objective:** Configure Quasar for PWA + Capacitor deployment

**Tasks:**
- [ ] Configure PWA mode with offline capabilities
- [ ] Set up Capacitor for iOS/Android builds
- [ ] Configure app manifest (name, icons, theme colors)
- [ ] Set up environment variables for API endpoints
- [ ] Configure SSL/HTTPS for secure communication

**Files to create/modify:**
```
src-pwa/
  ├── manifest.json          # PWA manifest
  ├── register-service-worker.ts
  └── custom-service-worker.ts
src-capacitor/
  ├── capacitor.config.ts    # Capacitor configuration
  └── android/ & ios/        # Native project folders
quasar.config.ts             # Enable PWA + Capacitor modes
```

**Acceptance Criteria:**
- App installable on mobile browsers (Add to Home Screen)
- Capacitor builds successfully for iOS and Android
- Offline mode shows cached data

### 1.2 Authentication System

**Objective:** Implement secure OAuth2 authentication with multiple login methods

#### 1.2.1 Backend API Changes Required (colab-api2)

**New Feature: Multi-Identifier Login**
Allow customers to login with email, mobile, OR subscription account number.

**Tasks (Backend):**
- [ ] Add `account_number` field to `subscriptions` table
- [ ] Create migration: `add_account_number_to_subscriptions`
- [ ] Modify `User::findForPassport()` to accept multiple identifiers
- [ ] Create `FindUserByIdentifierTask` to lookup by email/mobile/account_number
- [ ] Update `IssueTokenRequest` validation rules
- [ ] Add customer-specific routes with `customer.` prefix

**User Model Changes:**
```php
// app/Containers/AppSection/User/Models/User.php
public function findForPassport(string $username): ?self
{
    // Try email first (existing behavior)
    $user = self::whereRaw('lower(email) = lower(?)', [$username])->first();
    if ($user) return $user;

    // Try mobile number
    $user = self::where('mobile', $username)->first();
    if ($user) return $user;

    // Try subscription account number
    $contact = Contact::whereHas('subscriptions', function ($q) use ($username) {
        $q->where('account_number', $username);
    })->first();

    return $contact?->user;
}
```

**New Subscription Migration:**
```php
Schema::table('subscriptions', function (Blueprint $table) {
    $table->string('account_number', 20)->unique()->nullable()->after('supply_point_code');
    $table->index('account_number');
});
```

#### 1.2.2 Frontend Authentication Implementation

**Tasks (Frontend):**
- [ ] Create `src/stores/auth.ts` - Authentication Pinia store
- [ ] Create `src/services/api.ts` - Axios instance with interceptors
- [ ] Create `src/services/auth.service.ts` - Auth API calls
- [ ] Implement token storage (secure storage for mobile)
- [ ] Implement automatic token refresh
- [ ] Create login page with multi-identifier support
- [ ] Create password reset flow (forgot password)
- [ ] Create invitation acceptance flow
- [ ] Implement logout with token revocation

**Files to create:**
```
src/
  ├── stores/
  │   └── auth.ts              # Auth state management
  ├── services/
  │   ├── api.ts               # Axios configuration
  │   └── auth.service.ts      # Auth API calls
  ├── pages/
  │   └── auth/
  │       ├── LoginPage.vue
  │       ├── ForgotPasswordPage.vue
  │       ├── ResetPasswordPage.vue
  │       └── AcceptInvitePage.vue
  ├── composables/
  │   └── useAuth.ts           # Auth composable
  └── router/
      └── guards.ts            # Navigation guards
```

**Auth Store Structure:**
```typescript
// src/stores/auth.ts
interface AuthState {
  user: User | null;
  contact: Contact | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface LoginCredentials {
  identifier: string;  // email, mobile, or account_number
  password: string;
}
```

**Token Management Strategy:**

The API provides the following token configuration:
- **Access Token:** Expires in 1,440 minutes (1 day) - configurable via `API_TOKEN_EXPIRES`
- **Refresh Token:** Expires in 43,200 minutes (30 days) - configurable via `API_REFRESH_TOKEN_EXPIRES`

**API Endpoints:**
```
POST /v1/clients/web/login     → Returns: access_token + refresh_token + expires_in
POST /v1/clients/web/refresh   → Body: { refresh_token } → Returns: new access_token + new refresh_token
POST /v1/revoke-token          → Revoke current token (logout)
```

**Response Format:**
```json
{
  "type": "PasswordToken",
  "token_type": "Bearer",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbG...",
  "refresh_token": "ZFDPA1S7H8Wydjkjl+xt+hPGWTagX...",
  "expires_in": 86400
}
```

**Frontend Token Strategy:**

1. **Storage Location:**
   - Access Token: Memory (Pinia store) + Capacitor Secure Storage
   - Refresh Token: Capacitor Secure Storage only (never in memory longer than needed)
   - Token Expiry: Store `expires_at` timestamp for proactive refresh

2. **Proactive Token Refresh:**
   - Calculate `expires_at = Date.now() + (expires_in * 1000)`
   - Set timer to refresh 5 minutes (300 seconds) before expiration
   - On app resume/foreground: Check if token needs refresh

3. **Reactive Token Refresh (401 Handling):**
   - Intercept 401 responses
   - Queue failed requests
   - Attempt refresh with stored refresh_token
   - Retry queued requests with new access_token
   - If refresh fails → clear tokens → redirect to login

4. **Token Refresh Implementation:**
```typescript
// src/services/auth.service.ts
async refreshAccessToken(): Promise<TokenResponse> {
  const refreshToken = await SecureStorage.get('refresh_token');

  const response = await axios.post('/v1/clients/web/refresh', {
    refresh_token: refreshToken
  });

  // Store new tokens
  await this.storeTokens(response.data);

  // Reschedule next refresh
  this.scheduleTokenRefresh(response.data.expires_in);

  return response.data;
}
```

5. **Axios Interceptor with Queue:**
```typescript
// src/services/api.ts
let isRefreshing = false;
let failedQueue: Array<{resolve: Function, reject: Function}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const authStore = useAuthStore();
        const newToken = await authStore.refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        const authStore = useAuthStore();
        authStore.logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

6. **App Lifecycle Handling (Capacitor):**
```typescript
// src/boot/capacitor.ts
import { App } from '@capacitor/app';

App.addListener('appStateChange', async ({ isActive }) => {
  if (isActive) {
    const authStore = useAuthStore();
    // Check if token is expired or about to expire
    if (authStore.isTokenExpiringSoon()) {
      await authStore.refreshAccessToken();
    }
  }
});

App.addListener('resume', async () => {
  const authStore = useAuthStore();
  await authStore.checkAndRefreshToken();
});
```

7. **Secure Storage (Capacitor):**
```typescript
// src/utils/storage.ts
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

export const secureStorage = {
  async set(key: string, value: string): Promise<void> {
    await SecureStoragePlugin.set({ key, value });
  },

  async get(key: string): Promise<string | null> {
    try {
      const { value } = await SecureStoragePlugin.get({ key });
      return value;
    } catch {
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    await SecureStoragePlugin.remove({ key });
  },

  async clear(): Promise<void> {
    await SecureStoragePlugin.clear();
  }
};
```

8. **Logout Flow:**
```typescript
async logout(): Promise<void> {
  try {
    // Revoke token on server
    await api.post('/v1/revoke-token');
  } catch (e) {
    // Continue logout even if revoke fails
  }

  // Clear local storage
  await secureStorage.remove('access_token');
  await secureStorage.remove('refresh_token');
  await secureStorage.remove('token_expires_at');

  // Clear memory
  this.accessToken = null;
  this.refreshToken = null;
  this.user = null;

  // Cancel refresh timer
  this.cancelTokenRefreshTimer();

  // Navigate to login
  router.push('/auth/login');
}
```

**Acceptance Criteria:**
- Users can login with email, mobile number, or account number
- Tokens persist across app restarts
- Automatic token refresh works seamlessly
- Invalid/expired tokens redirect to login
- Password reset email flow works
- Invitation acceptance creates account and logs in

### 1.3 Invitation System Integration

**Objective:** Allow new customers to accept invitations and create accounts

**Tasks:**
- [ ] Create invitation acceptance page
- [ ] Handle deep links for invitation tokens
- [ ] Validate invitation before accepting
- [ ] Create account from invitation data
- [ ] Auto-login after successful invitation acceptance

**Flow:**
1. Customer receives email with link: `https://app.example.com/invite/{token}`
2. App opens, navigates to `AcceptInvitePage.vue`
3. Page calls `GET /invites/{token}` to validate
4. Shows invitation details (entity name, role, inviter)
5. Customer sets password and accepts
6. Calls `POST /invites/{token}/accept` with password
7. Backend creates user/contact, returns success
8. Frontend auto-logs in with new credentials

---

## Phase 2: Core Customer Features

### 2.1 Dashboard

**Objective:** Provide overview of customer's utility services

**Tasks:**
- [ ] Create dashboard layout
- [ ] Show account balance summary
- [ ] Display recent invoices (last 3)
- [ ] Show current month usage comparison
- [ ] Display active alerts/notifications count
- [ ] Quick actions (pay invoice, submit reading, contact support)

**Files:**
```
src/pages/
  └── dashboard/
      └── DashboardPage.vue
src/components/dashboard/
  ├── BalanceSummaryCard.vue
  ├── RecentInvoicesCard.vue
  ├── UsageComparisonCard.vue
  └── QuickActionsCard.vue
```

### 2.2 Invoices Module

**Objective:** Allow customers to view and manage their invoices

**Tasks:**
- [ ] Create invoice list page with filters
- [ ] Implement invoice detail view
- [ ] Show payment status and history
- [ ] Download invoice PDF
- [ ] Display payment due alerts
- [ ] Filter by status (paid, unpaid, overdue)
- [ ] Filter by date range

**API Endpoints Used:**
```
GET /entities/{entity}/subscriptions/{subscription}/invoices
GET /entities/{entity}/subscriptions/{subscription}/invoices/{invoice}
GET /entities/{entity}/subscriptions/{subscription}/invoices/{invoice}/receipts
```

**Files:**
```
src/pages/
  └── invoices/
      ├── InvoiceListPage.vue
      └── InvoiceDetailPage.vue
src/components/invoices/
  ├── InvoiceCard.vue
  ├── InvoiceStatusBadge.vue
  ├── PaymentHistoryList.vue
  └── InvoiceFilters.vue
src/stores/
  └── invoices.ts
src/services/
  └── invoice.service.ts
```

**Features:**
- Pull-to-refresh on mobile
- Infinite scroll pagination
- Status color coding (green=paid, yellow=pending, red=overdue)
- Due date countdown
- PDF download/share

### 2.3 Usage/Consumption Module

**Objective:** Display consumption data and trends

**Tasks:**
- [ ] Create usage overview page
- [ ] Display current period consumption
- [ ] Show historical usage charts
- [ ] Compare usage periods (month-over-month, year-over-year)
- [ ] Display anomaly warnings
- [ ] Show meter readings history
- [ ] Allow customer to submit meter readings (if enabled)

**API Endpoints Used:**
```
GET /entities/{entity}/subscriptions/{subscription}/usages
GET /entities/{entity}/subscriptions/{subscription}/meters
GET /entities/{entity}/subscriptions/{subscription}/statistics/usage
```

**Files:**
```
src/pages/
  └── usage/
      ├── UsageOverviewPage.vue
      ├── UsageHistoryPage.vue
      └── SubmitReadingPage.vue
src/components/usage/
  ├── UsageChart.vue
  ├── ConsumptionCard.vue
  ├── MeterReadingCard.vue
  ├── AnomalyAlert.vue
  └── UsageComparisonChart.vue
src/stores/
  └── usage.ts
src/services/
  └── usage.service.ts
```

**Chart Library:** Use `vue-chartjs` or `apexcharts` for interactive charts

### 2.4 Subscriptions Module

**Objective:** Display customer's service contracts

**Tasks:**
- [ ] Create subscriptions list page
- [ ] Show subscription details (contract info, meters, plan)
- [ ] Display service status (active/inactive)
- [ ] Show associated meters
- [ ] Display current plan details

**API Endpoints Used:**
```
GET /entities/{entity}/subscriptions
GET /entities/{entity}/subscriptions/{subscription}
GET /entities/{entity}/subscriptions/{subscription}/meters
```

**Files:**
```
src/pages/
  └── subscriptions/
      ├── SubscriptionListPage.vue
      └── SubscriptionDetailPage.vue
src/components/subscriptions/
  ├── SubscriptionCard.vue
  ├── MetersList.vue
  └── PlanDetailsCard.vue
src/stores/
  └── subscriptions.ts
```

### 2.5 Alerts & Notifications

**Objective:** Keep customers informed about important events

**Tasks:**
- [ ] Create notifications list page
- [ ] Implement push notifications (Capacitor)
- [ ] Display in-app notification badges
- [ ] Mark notifications as read
- [ ] Filter by type (invoices, usage, system)
- [ ] Implement notification preferences

**API Endpoints Used:**
```
GET /entities/{entity}/alerts
PATCH /entities/{entity}/alerts/{alert}
GET /entities/{entity}/alert-preferences
PATCH /entities/{entity}/alert-preferences
```

**Push Notification Setup (Capacitor):**
- Firebase Cloud Messaging (FCM) for Android
- Apple Push Notification Service (APNS) for iOS
- Store device token on backend for targeting

**Files:**
```
src/pages/
  └── notifications/
      ├── NotificationListPage.vue
      └── NotificationPreferencesPage.vue
src/components/notifications/
  ├── NotificationItem.vue
  └── NotificationBadge.vue
src/stores/
  └── notifications.ts
src/services/
  └── push-notification.service.ts
```

---

## Phase 3: Customer Support & Communication

### 3.1 Support/Messaging Module

**Objective:** Allow customers to communicate with service providers

**Tasks:**
- [ ] Create support channels list
- [ ] Implement real-time messaging (WebSocket)
- [ ] Support file attachments
- [ ] Display message threads
- [ ] Show unread message indicators

**API Endpoints Used:**
```
GET /entities/{entity}/channels
GET /entities/{entity}/channels/{channel}/messages
POST /entities/{entity}/channels/{channel}/messages
```

**Real-time Setup:**
- Laravel Reverb WebSocket connection
- Capacitor WebSocket support
- Reconnection handling

**Files:**
```
src/pages/
  └── support/
      ├── ChannelListPage.vue
      └── ChatPage.vue
src/components/support/
  ├── MessageBubble.vue
  ├── ChatInput.vue
  └── AttachmentPicker.vue
src/services/
  └── websocket.service.ts
src/stores/
  └── messages.ts
```

### 3.2 Documents Module

**Objective:** Access invoices, contracts, and other documents

**Tasks:**
- [ ] Create documents list page
- [ ] Filter by document type
- [ ] Download/share documents
- [ ] View PDF inline (mobile)

**Files:**
```
src/pages/
  └── documents/
      └── DocumentListPage.vue
src/components/documents/
  ├── DocumentCard.vue
  └── DocumentViewer.vue
```

---

## Phase 4: Profile & Settings

### 4.1 Profile Management

**Objective:** Allow customers to manage their account

**Tasks:**
- [ ] Create profile view/edit page
- [ ] Update contact information
- [ ] Change password
- [ ] Manage notification preferences
- [ ] Upload avatar
- [ ] View linked subscriptions

**API Endpoints Used:**
```
GET /v1/profile
PATCH /v1/profile
GET /v1/profile/settings
PATCH /v1/profile/settings/{setting}
```

**Files:**
```
src/pages/
  └── profile/
      ├── ProfilePage.vue
      ├── EditProfilePage.vue
      ├── ChangePasswordPage.vue
      └── SettingsPage.vue
src/stores/
  └── profile.ts
```

### 4.2 App Settings

**Objective:** Configure app behavior

**Tasks:**
- [ ] Language selection (i18n)
- [ ] Theme selection (light/dark)
- [ ] Notification preferences
- [ ] Biometric authentication toggle
- [ ] Cache management

**Files:**
```
src/stores/
  └── settings.ts
src/composables/
  └── useTheme.ts
```

---

## Phase 5: Advanced Features

### 5.1 Offline Support

**Objective:** Allow basic app functionality without internet

**Tasks:**
- [ ] Cache recent data (invoices, usage, profile)
- [ ] Queue actions for sync when online
- [ ] Show offline indicator
- [ ] Sync on reconnection

**Implementation:**
- Service Worker for PWA caching
- IndexedDB for structured data
- Background sync for queued actions

### 5.2 Biometric Authentication

**Objective:** Allow fingerprint/face authentication

**Tasks:**
- [ ] Implement Capacitor biometric plugin
- [ ] Store credentials securely
- [ ] Enable/disable in settings
- [ ] Fallback to PIN/password

**Plugin:** `@aparajita/capacitor-biometric-auth`

### 5.3 Deep Linking

**Objective:** Handle app links from emails/notifications

**Tasks:**
- [ ] Configure universal links (iOS)
- [ ] Configure app links (Android)
- [ ] Handle invitation links
- [ ] Handle notification links
- [ ] Handle password reset links

**Links to handle:**
```
https://app.example.com/invite/{token}
https://app.example.com/reset-password/{token}
https://app.example.com/invoices/{id}
https://app.example.com/notifications/{id}
```

---

## Technical Architecture

### Directory Structure

```
colab-client2/
├── src/
│   ├── assets/                    # Static assets
│   ├── boot/
│   │   ├── axios.ts              # API configuration
│   │   ├── i18n.ts               # Internationalization
│   │   └── capacitor.ts          # Capacitor plugins init
│   ├── components/
│   │   ├── common/               # Shared components
│   │   │   ├── AppHeader.vue
│   │   │   ├── BottomNavigation.vue
│   │   │   ├── LoadingSpinner.vue
│   │   │   ├── EmptyState.vue
│   │   │   ├── ErrorState.vue
│   │   │   └── PullToRefresh.vue
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── invoices/
│   │   ├── usage/
│   │   ├── subscriptions/
│   │   ├── notifications/
│   │   ├── support/
│   │   ├── documents/
│   │   └── profile/
│   ├── composables/
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useNotifications.ts
│   │   ├── useTheme.ts
│   │   └── useOffline.ts
│   ├── layouts/
│   │   ├── AuthLayout.vue        # Login/register layout
│   │   └── MainLayout.vue        # Authenticated layout
│   ├── pages/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── invoices/
│   │   ├── usage/
│   │   ├── subscriptions/
│   │   ├── notifications/
│   │   ├── support/
│   │   ├── documents/
│   │   └── profile/
│   ├── router/
│   │   ├── index.ts
│   │   ├── routes.ts
│   │   └── guards.ts
│   ├── services/
│   │   ├── api.ts                # Axios instance
│   │   ├── auth.service.ts
│   │   ├── invoice.service.ts
│   │   ├── usage.service.ts
│   │   ├── subscription.service.ts
│   │   ├── notification.service.ts
│   │   ├── message.service.ts
│   │   ├── document.service.ts
│   │   ├── profile.service.ts
│   │   ├── websocket.service.ts
│   │   └── push-notification.service.ts
│   ├── stores/
│   │   ├── auth.ts
│   │   ├── invoices.ts
│   │   ├── usage.ts
│   │   ├── subscriptions.ts
│   │   ├── notifications.ts
│   │   ├── messages.ts
│   │   ├── profile.ts
│   │   └── settings.ts
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   ├── invoice.types.ts
│   │   ├── usage.types.ts
│   │   ├── subscription.types.ts
│   │   ├── notification.types.ts
│   │   └── user.types.ts
│   ├── utils/
│   │   ├── date.ts
│   │   ├── currency.ts
│   │   ├── storage.ts
│   │   └── validators.ts
│   └── i18n/
│       ├── en-US/
│       └── ro-RO/
├── src-pwa/
│   ├── manifest.json
│   ├── register-service-worker.ts
│   └── custom-service-worker.ts
├── src-capacitor/
│   ├── capacitor.config.ts
│   ├── android/
│   └── ios/
└── public/
    ├── icons/                    # App icons (various sizes)
    └── splash/                   # Splash screens
```

### API Service Pattern

```typescript
// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { useAuthStore } from 'src/stores/auth';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`;
  }
  return config;
});

// Response interceptor - handle 401, refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();

    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      try {
        await authStore.refreshAccessToken();
        error.config.headers.Authorization = `Bearer ${authStore.accessToken}`;
        return api(error.config);
      } catch (refreshError) {
        authStore.logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### Store Pattern

```typescript
// src/stores/invoices.ts
import { defineStore } from 'pinia';
import { invoiceService } from 'src/services/invoice.service';
import type { Invoice, InvoiceFilters } from 'src/types/invoice.types';

interface InvoicesState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    perPage: number;
    total: number;
    hasMore: boolean;
  };
  filters: InvoiceFilters;
}

export const useInvoicesStore = defineStore('invoices', {
  state: (): InvoicesState => ({
    invoices: [],
    currentInvoice: null,
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      perPage: 20,
      total: 0,
      hasMore: true,
    },
    filters: {},
  }),

  getters: {
    unpaidInvoices: (state) =>
      state.invoices.filter(i => i.status !== 'paid'),
    overdueInvoices: (state) =>
      state.invoices.filter(i => i.status === 'overdue'),
    totalOwed: (state) =>
      state.invoices
        .filter(i => i.status !== 'paid')
        .reduce((sum, i) => sum + i.total, 0),
  },

  actions: {
    async fetchInvoices(subscriptionId: number, reset = false) {
      if (reset) {
        this.pagination.page = 1;
        this.invoices = [];
      }

      this.isLoading = true;
      this.error = null;

      try {
        const response = await invoiceService.getInvoices(subscriptionId, {
          page: this.pagination.page,
          per_page: this.pagination.perPage,
          ...this.filters,
        });

        this.invoices = reset
          ? response.data
          : [...this.invoices, ...response.data];

        this.pagination.total = response.meta.pagination.total;
        this.pagination.hasMore = response.meta.pagination.has_more;
        this.pagination.page++;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchInvoice(subscriptionId: number, invoiceId: number) {
      this.isLoading = true;
      try {
        const response = await invoiceService.getInvoice(subscriptionId, invoiceId);
        this.currentInvoice = response.data;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },

    setFilters(filters: InvoiceFilters) {
      this.filters = filters;
    },
  },
});
```

---

## Capacitor Configuration

```typescript
// src-capacitor/capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.colab.customer',
  appName: 'CoLab Customer',
  webDir: 'dist/spa',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1976D2',
      showSpinner: true,
      spinnerColor: '#ffffff',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    App: {
      // Deep linking configuration
    },
  },
  android: {
    allowMixedContent: false,
  },
  ios: {
    scheme: 'CoLab Customer',
  },
};

export default config;
```

---

## Required Dependencies

### Production Dependencies
```json
{
  "dependencies": {
    "@capacitor/app": "^6.0.0",
    "@capacitor/core": "^6.0.0",
    "@capacitor/haptics": "^6.0.0",
    "@capacitor/keyboard": "^6.0.0",
    "@capacitor/push-notifications": "^6.0.0",
    "@capacitor/splash-screen": "^6.0.0",
    "@capacitor/status-bar": "^6.0.0",
    "@capacitor/storage": "^1.2.5",
    "@aparajita/capacitor-biometric-auth": "^7.0.0",
    "vue-chartjs": "^5.3.0",
    "chart.js": "^4.4.0",
    "date-fns": "^3.0.0"
  }
}
```

### Dev Dependencies
```json
{
  "devDependencies": {
    "@capacitor/cli": "^6.0.0",
    "@quasar/app-vite": "^2.1.0"
  }
}
```

---

## Backend API Changes Summary

### New Migrations Required
1. `add_account_number_to_subscriptions` - Add account_number field
2. `add_device_tokens_table` - Store push notification tokens

### New/Modified Files
1. `User::findForPassport()` - Multi-identifier lookup
2. `FindUserByIdentifierTask` - New task for flexible user lookup
3. `IssueTokenRequest` - Allow identifier instead of email
4. Customer-specific routes file (optional)

### New API Endpoints (Customer-specific)
```
POST /v1/customer/login              # Multi-identifier login
POST /v1/customer/device-token       # Register push token
DELETE /v1/customer/device-token     # Remove push token
GET /v1/customer/dashboard           # Dashboard summary endpoint
```

---

## Testing Strategy

### Unit Tests
- Store actions and getters
- Service methods
- Utility functions
- Composables

### E2E Tests (Cypress/Playwright)
- Authentication flows
- Invoice viewing
- Usage data display
- Navigation

### Device Testing
- iOS Simulator/TestFlight
- Android Emulator/Internal Testing
- Various screen sizes

---

## Security Considerations

1. **Token Storage:** Use Capacitor Secure Storage for tokens
2. **Certificate Pinning:** Implement SSL pinning for API calls
3. **Biometric Auth:** Secure credential storage with biometrics
4. **Input Validation:** Validate all user inputs
5. **Session Timeout:** Auto-logout after inactivity
6. **Sensitive Data:** Never log sensitive information

---

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Lighthouse Score | > 90 |
| Bundle Size | < 500KB (gzipped) |
| API Response Handling | < 100ms |

---

## Implementation Order

### Sprint 1: Foundation
1. Project configuration (PWA + Capacitor)
2. Auth store and service
3. Login page
4. Basic routing with guards

### Sprint 2: Core Auth
1. Password reset flow
2. Invitation acceptance
3. Token refresh mechanism
4. Biometric auth (optional)

### Sprint 3: Dashboard & Invoices
1. Dashboard page
2. Invoice list and detail
3. Invoice filters

### Sprint 4: Usage & Subscriptions
1. Usage overview
2. Usage charts
3. Subscription list and detail

### Sprint 5: Notifications & Support
1. Notifications list
2. Push notifications setup
3. Support messaging

### Sprint 6: Profile & Polish
1. Profile management
2. Settings page
3. Offline support
4. Final testing

---

## Success Metrics

- **User Adoption:** 50% of customers using app within 3 months
- **Engagement:** Average 3+ sessions per week
- **Support Reduction:** 20% reduction in support calls
- **Payment Time:** 15% faster invoice payments
- **App Rating:** 4.5+ stars on app stores

---

## Next Steps

1. Review and approve this plan
2. Set up Capacitor in the project
3. Begin Phase 1 implementation
4. Create backend API changes for multi-identifier login

---

*Document Version: 1.0*
*Created: December 2024*
*Last Updated: December 2024*
