# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CoLab Customer Portal** - A self-service utility customer portal built with Quasar (Vue 3). Similar to the app your electric/gas/water company provides for customers to manage their accounts online.

### What customers can do:
- **Dashboard** - Overview of unpaid/overdue invoices, subscription list with last meter readings
- **Invoices** - View all invoices, filter by status, download PDFs, pay online via Stripe
- **Subscriptions** - View utility contracts (electricity, gas, water, sewage), meters, usage history
- **Profile** - Manage account settings
- **Payments** - Stripe checkout for paying invoices

### Key features:
- **Multi-entity** - One customer can have accounts with multiple utility providers, switch between them
- **Multiple auth flows** - Password login, MFA (2FA via SMS/email), passwordless OTP login
- **Mobile-first** - Bottom navigation, Capacitor for iOS/Android, PWA enabled
- **Bilingual** - English (en-US) and Romanian (ro-RO)

### Related projects:
- `colab-api2` - Laravel backend API (sibling directory)
- `colab-ui2` - Admin/operator portal for utility company staff (manages customers, invoices, meter readings)

## Commands

```bash
# Development
npm run dev          # Start dev server with hot reload (opens browser)
quasar dev           # Alternative

# Build
npm run build        # Production build
quasar build         # Alternative

# Lint & Format
npm run lint         # ESLint check
npm run format       # Prettier format
```

## Architecture

### Boot Files (`src/boot/`)
Boot files run before the Vue app mounts. Order matters (defined in `quasar.config.ts`):
- `i18n` - Vue i18n setup
- `axios` - API client with JWT interceptors and auto token refresh
- `appInit` - Loads profile/entity data on authenticated routes
- `capacitor` - Mobile platform initialization

### State Management (`src/stores/`)
Pinia stores using Composition API pattern:
- `auth` - Authentication with MFA and OTP (passwordless) support
- `profile` - User profile data
- `entity` - Customer entities (multi-entity support)

**Store-API Sync Pattern:**
- Stores use `isLoaded` and `isLoading` flags to track fetch state
- `appInit` boot file coordinates initial data loading after login/refresh
- Stores call services (never API directly): `store.fetch*()` → `service.get*()` → `api.get()`
- Auth tokens and selected entity persisted to `LocalStorage`
- On logout, `clearAppData()` resets profile and entity stores

### Services (`src/services/`)
API service layer - all HTTP calls go through services, not directly from components:
```typescript
import { invoiceService } from 'src/services/invoice.service';
const invoices = await invoiceService.getInvoices(entityId, filters);
```

### Types (`src/types/`)
TypeScript interfaces organized by domain. Import from barrel:
```typescript
import type { Invoice, Subscription } from 'src/types';
```

### Routing
- `/auth/*` - Guest-only routes (login, forgot password)
- `/password/reset` - Password reset from email link
- `/*` - Authenticated routes (dashboard, invoices, subscriptions, profile)

Route guards in `src/router/index.ts` check `requiresAuth` and `requiresGuest` meta fields.

### Entity-Scoped API
Most API endpoints are scoped to an entity: `/entities/{entityId}/invoices`. Always use `entityStore.selectedEntityId` when calling services.

## Conventions

### Vue Components
- Use `<script setup lang="ts">` (Composition API)
- Page components in `src/pages/{domain}/{Name}Page.vue`
- Styles use SASS with scoped attribute

### i18n
Two locales: `en-US` and `ro-RO`. Access via `$t()` in templates or `useI18n()` in setup.

### Icons
Line Awesome icons via `las la-*` naming (e.g., `las la-home`).

### CSS Variables
App uses custom CSS variables defined in `src/css/quasar.variables.sass`:
- `--space-*` for spacing
- `--color-*` for colors
- `--radius-*` for border radius

## Backend API

Default API URL: `http://localhost:8002/v1` (configurable via `API_URL` env var).

The backend is a Laravel API located at `../colab-api2` (sibling directory). Run via Laravel Sail:
```bash
cd ../colab-api2 && sail up -d
```

### API Endpoints

**Authentication (`auth.service.ts`, `mfa.service.ts`)**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Login with email/password, returns tokens or MFA challenge |
| POST | `/logout` | Invalidate token |
| GET | `/profile` | Get current user profile |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/forgot-password` | Request password reset email |
| POST | `/reset-password` | Reset password with token (returns tokens) |
| POST | `/auth/check` | Check auth method (password vs OTP) for identifier |
| POST | `/auth/otp/request` | Request OTP code via SMS/email |
| POST | `/auth/otp/verify` | Verify OTP and complete login |
| POST | `/auth/mfa/challenge` | Request MFA challenge (send OTP) |
| POST | `/auth/mfa/verify` | Verify MFA code and complete login |

**Entities (`entity.service.ts`)**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/entities` | List customer's entities |
| GET | `/entities/{id}` | Get single entity |

**Subscriptions (`subscription.service.ts`)**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/entities/{id}/subscriptions` | List subscriptions |
| GET | `/entities/{id}/subscriptions/{subId}` | Get subscription details |
| GET | `/entities/{id}/subscriptions/{subId}/meters` | Get meters |
| GET | `/entities/{id}/subscriptions/{subId}/statistics/usage` | Usage statistics |
| GET | `/entities/{id}/subscriptions/{subId}/statistics/financial` | Financial statistics |

**Invoices (`invoice.service.ts`)**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/entities/{id}/invoices` | List invoices (supports filters) |
| GET | `/entities/{id}/invoices/{invId}` | Get invoice with items/receipts |
| GET | `/entities/{id}/invoices/{invId}/items` | Get invoice line items |
| GET | `/entities/{id}/invoices/{invId}/receipts` | Get invoice payments |
| GET | `/entities/{id}/invoices/status-counts` | Get counts by status |
| GET | `/entities/{id}/invoices/statistics` | Get invoice totals |
| GET | `/entities/{id}/invoices/{invId}?export=pdf` | Download PDF |

**Usage (`usage.service.ts`)**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/entities/{id}/subscriptions/{subId}/usages` | List usage records |
| GET | `/entities/{id}/subscriptions/{subId}/usages/{usageId}` | Get usage detail |

**Payments (`payment.service.ts`)**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/entities/{id}/payment-config` | Get Stripe config |
| POST | `/entities/{id}/invoices/{invId}/payment-intent` | Create Stripe payment intent |
| GET | `/entities/{id}/invoices/{invId}/checkout/{receiptId}/status` | Get checkout status |
