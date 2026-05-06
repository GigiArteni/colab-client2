# Changelog

## [Unreleased] — 2026-05-06

### Summary

Comprehensive multi-tenant refactor, Phase 2b error contract wiring, and full
Playwright e2e coverage across the customer portal.

### Breaking changes

- **Tenant subdomain required.** Customers must access the portal via their provider's
  subdomain (e.g., `acme.colab-client.app`). Visiting the apex domain (`colab-client.app`)
  now shows a no-workspace landing page instead of the login form.
- **Pre-bearer auth requests include `tenant` body field.** The `/login`,
  `/forgot-password`, `/auth/otp/request`, `/auth/check`, and `/register` endpoints now
  receive `tenant: <slug>` in the request body. Any integration that posts to these
  endpoints without a slug will receive a `tenant_required` error from the API.
- **`/auth/login` route removed.** The entry point is now tenant-scoped. Direct links to
  `/auth/login` without a valid subdomain context are redirected to `/auth/no-workspace`.

### New features

#### Customer portal features wired to API

- **Invoice corrections** — correction chain and linked correction list in
  `InvoiceHistoryTab` (`GET /invoices/{id}/corrections`).
- **Invoice status history** — full status log timeline (`GET /invoices/{id}/status-logs`).
- **Meter readings history** — paginated reading list per meter
  (`GET /subscriptions/{id}/meters/{meterId}/usages`).
- **Subscription customer info** — billing name, email, phone, tax ID, address
  (`GET /subscriptions/{id}/customer-info`).
- **Alert preferences CRUD** — create, update, delete notification preferences per alert
  type with channel (email/SMS/in-app) and quiet-hours configuration.
- **Alert dismiss** — dismiss individual alerts from the notification center
  (`POST /alerts/{id}/dismiss`).
- **Profile settings** — notification preference matrix and localization settings
  (`GET/PUT /profile/settings`).
- **Contact settings** — billing email override, preferred channel, notification opt-ins
  (`GET/PUT /profile/contact-settings`).
- **Push device tokens** — list registered devices, revoke a device token
  (`GET /profile/devices`, `DELETE /profile/devices/{id}`).

#### Architecture

- **6 new composables**: `useTenant`, `useEntityContext`, `useApi`, `usePagination`,
  `useForm`, `useEmptyState`.
- **5 UI primitives**: `LoadingSkeleton`, `ErrorBanner`, `EmptyState`, `ConfirmDialog`,
  `PageHeader` in `src/components/ui/`.
- **5 God components decomposed** into focused root + extracted children (≤ 300 LOC
  per root): `LoginPage`, `OtpLoginPage`, `UsageOverviewPage`, `AlertPreferencesPage`,
  `InvoiceDetailPage`.
- **Tenant entry flow**: `tenant.ts` boot validates workspace on every app start; axios
  interceptor handles mid-session tenant errors.
- **i18n error contract**: `tenancyError.<message_key>` lookup for all BE-originated
  tenant/auth errors; `i18n:check` and `i18n:parity` scripts enforce key coverage.

### Tests

- **81% statement coverage** — 58 Vitest spec files, 388 passing tests.
- **~33 Playwright e2e specs** covering:
  - Auth flows: password login, OTP login, MFA, forgot-password, reset-password.
  - Tenant flows: no-workspace landing, unknown-workspace redirect, slug resolution.
  - Layout: navigation, mobile menu, notification center.
  - Features: dashboard, invoice list/detail/history, subscription detail, meter
    readings, alert preferences, profile settings, contact settings, devices tab.
  - Capacitor: push notification permission, safe-area rendering.

### Internal

- ESLint 0 errors (was 180+).
- `payments.*` locale namespace merged into main locale files (was orphaned).
- `src/i18n/{en-US,ro-RO}/payments.ts` deleted (keys now in `index.ts`).
