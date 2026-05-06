# colab-client2 — Customer Portal

Vue 3 + Quasar Framework customer-facing portal for the CoLab utility management platform.
Multi-tenant by subdomain: each provider's customers access via `<slug>.colab-client.app`.

## Install dependencies

```bash
npm install
```

## Development

### Web (SPA)

```bash
quasar dev
```

### Tenant subdomain — testing locally

The portal resolves the workspace slug from `window.location.hostname`
(`acme.colab-client.app` → tenant `acme`). Three ways to hit a subdomain on localhost:

- **lvh.me** (zero config): `http://acme.lvh.me:9000` — `*.lvh.me` resolves to `127.0.0.1` via public DNS.
- **/etc/hosts**: add `127.0.0.1 acme.localhost`, then visit `http://acme.localhost:9000`.
- **Quasar host flag**: `quasar dev --hostname 0.0.0.0` for cross-device testing.

Apex hosts (`localhost`, `colab-client.app`) and reserved subdomains (`www`, `app`, `api`,
`admin`) produce no slug and route to the no-workspace landing page.

### Tenant entry flow

1. `tenant.ts` boot reads slug from hostname, calls `GET /v1/public/workspaces/<slug>`.
2. Missing/inactive workspace → redirects to `/auth/unknown-workspace?reason=<key>`.
3. No slug (apex) → redirects to `/auth/no-workspace`.
4. Active workspace → app boots; login page accepts `identifier` + `password` (or OTP).
5. Auth requests include `tenant: <slug>` in the request body so the BE can resolve the
   correct tenant DB even on a single API host.
6. Post-login, the Bearer token encodes tenant context; subsequent requests resolve via
   `oauth_token_tenant_index` (no body field needed).

## Testing

### Unit / component tests (Vitest)

```bash
npm test                  # run all specs
npm run test:coverage     # with v8 coverage report (target: ≥ 80% statement)
```

Specs live alongside source files as `*.spec.ts`. Coverage report: `coverage/`.

### End-to-end tests (Playwright)

```bash
npm run test:e2e          # run all e2e specs
npx playwright test --ui  # interactive UI mode
```

Playwright specs are in `tests/e2e/`. They cover auth flows, layout, tenant resolution,
and all major feature pages (dashboard, invoices, subscriptions, meters, profile, alerts,
notifications).

## Lint & type-check

```bash
npm run lint              # ESLint (0 errors expected)
npm run format            # Prettier format
npm run i18n:check        # verify all $t() keys exist in en-US locale
npm run i18n:parity       # verify ro-RO has the same keys as en-US
```

TypeScript checking is done via Volar / vue-tsc as part of the Quasar build.

## Build

```bash
quasar build                              # production web SPA → dist/spa/
quasar dev -m capacitor -T android        # Capacitor Android dev
quasar dev -m capacitor -T ios            # Capacitor iOS dev (Mac + Xcode required)
quasar build -m capacitor -T android      # Android release
quasar build -m capacitor -T ios          # iOS release
```

## Composables catalog

Six composables in `src/composables/` provide shared reactive behaviour:

| Composable | Purpose |
|-----------|---------|
| `useTenant` | Reads slug from subdomain, workspace lookup, `isReady` flag |
| `useEntityContext` | Current entity selection (wraps `entityStore`) |
| `useApi` | One-off async fetch with `loading` / `error` / `data` + auto-cancel |
| `usePagination` | Bridges Quasar QTable pagination to BE `PaginationMeta` |
| `useForm` | Field validation rules + server 422 error mapping |
| `useEmptyState` | Derives `'loading' | 'error' | 'empty' | 'data'` display discriminant |

## Architecture

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for:
- Tenant resolution diagram
- Service → Store → Component data flow
- i18n error contract with the back-end
- Real-time channels (Laravel Echo)
- UI primitives reference
- Local subdomain testing options

## Directory structure

```
src/
├── boot/           # App init: tenant resolution, axios, i18n, echo, capacitor
├── composables/    # 6 shared composables (see catalog above)
├── components/
│   ├── ui/         # 5 UI primitives: LoadingSkeleton, ErrorBanner, EmptyState,
│   │               #   ConfirmDialog, PageHeader
│   ├── alerts/     # Alert preference form dialog
│   ├── invoices/   # Invoice history tab
│   └── profile/    # Profile settings, contact settings, registered devices
├── pages/          # Route-level page components (Quasar file-based routing)
├── services/       # Typed API wrappers (one file per domain)
├── stores/         # Pinia stores
├── types/          # Shared TypeScript interfaces
└── i18n/
    ├── en-US/      # English locale (master schema)
    └── ro-RO/      # Romanian locale
tests/
└── e2e/            # Playwright e2e specs
```

## Customize the configuration

See [Configuring quasar.config.ts](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
