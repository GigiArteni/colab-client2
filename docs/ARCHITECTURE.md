# colab-client2 Architecture

## Tenant Resolution Flow

The portal is multi-tenant by subdomain. Every customer accesses via `<slug>.colab-client.app`.

```
Browser → <slug>.colab-client.app
            │
            ▼
  [tenant.ts boot] useTenant().slug
            │
     ┌──────┴──────┐
   null          slug present
     │                │
     ▼                ▼
 /auth/no-      GET /v1/public/workspaces/<slug>
 workspace              │
                 ┌──────┴──────┐
             not found /    exists + active
             inactive          │
                │              ▼
                ▼         app boots normally
        /auth/unknown-    (useTenant().isReady = true)
        workspace?reason=…
```

### Login with tenant body field

Pre-bearer auth endpoints (`/login`, `/forgot-password`, `/auth/otp/request`, `/auth/check`)
receive `tenant: <slug>` in the request body so the API can resolve the tenant even on a
single-host deployment (no subdomain required server-side):

```
POST /v1/login
{ identifier, password, tenant: "acme" }
         │
         ▼
   BE resolves tenant from body → issues Passport token
         │
         ▼
   token stored in authStore + cookie
   subsequent requests carry Bearer token
   BE resolves tenant from oauth_token_tenant_index (Redis)
```

### Axios interceptor

`src/boot/axios.ts` attaches `tenant: slug` to every pre-bearer request body and
intercepts 401/403 responses carrying a `message_key` to map them to the `tenancyError`
i18n namespace and redirect to the appropriate error page.

---

## Service → Store → Component Data Flow

```
API (Laravel Apiato BE)
        │  HTTP (axios)
        ▼
  src/services/*.service.ts   ← thin wrappers; return typed data
        │
        ▼
  src/stores/*.ts  (Pinia)    ← state, actions, derived getters
        │
        ▼
  src/pages/**/*.vue          ← inject store(s), render
  src/components/**/*.vue     ← stateless where possible; receive props

Composables sit beside stores and provide:
  - useApi       → one-off fetch lifecycle (no store needed)
  - usePagination → QTable pagination ↔ BE PaginationMeta bridge
  - useForm      → field rules + 422 error mapping
  - useEmptyState → loading/error/empty/data discriminant
  - useEntityContext → current entity from entityStore
  - useTenant    → slug + workspace lookup + isReady flag
```

---

## i18n Contract with Back-end

All API error responses that the FE needs to present follow the shape:

```json
{ "message": "Human-readable fallback", "message_key": "tenant_inactive" }
```

The FE maps `error.message_key` to `tenancyError.<key>` in both locale files:

| `message_key`              | Displayed to user                                              |
|---------------------------|----------------------------------------------------------------|
| `tenant_unknown`          | Couldn't find your account — check the link                    |
| `tenant_inactive`         | Account currently inactive — contact support                   |
| `tenant_archived`         | Account archived — contact support                             |
| `tenant_unavailable`      | Service temporarily unavailable                                |
| `tenant_required`         | Use your personalised link to access this portal               |
| `tenant_required_for_route` | Use your personalised link to access this page               |
| `landlord_required`       | Page not available through the customer portal                 |
| `broadcast_no_tenant`     | Real-time updates unavailable — refresh for latest data        |

Unknown keys fall through to the raw `message` string or a generic error.

---

## Real-time via Laravel Echo

The app uses Laravel Echo (Pusher-compatible) over WebSockets (Laravel Reverb).
Connection is bootstrapped in `src/boot/echo.ts` after the auth token is available.

### Channels consumed

| Channel                              | Events                                          | Store / Component         |
|--------------------------------------|-------------------------------------------------|---------------------------|
| `private contact.{id}.alerts`       | `.alert.created` `.alert.sent` `.alert.dismissed` | `src/stores/alerts.ts`  |

Channel names use hashed IDs (server-side Hashids per-tenant salt). The `{id}` is the
contact's hashed ID as returned by the profile endpoint.

All subscriptions go through `src/composables/useEcho.ts`:
- `subscribe(channel, event, cb)` — private channel
- `subscribePublic(channel, event, cb)` — public channel
- `unsubscribe(channel)` — leave channel

`AlertNotificationCenter.vue` triggers `alertsStore.subscribeToAlerts()` on mount;
it unsubscribes on unmount.

---

## UI Primitives (`src/components/ui/`)

Shared display-layer building blocks. All accept standard Quasar-compatible props.

| Component        | Purpose                                                       |
|-----------------|----------------------------------------------------------------|
| `LoadingSkeleton` | Animated skeleton placeholder; accepts `lines` + `type` props |
| `ErrorBanner`   | Dismissable error strip; accepts `message` string             |
| `EmptyState`    | Centered icon + title + subtitle for zero-data states         |
| `ConfirmDialog` | Quasar Dialog plugin wrapper; returns `Promise<boolean>`      |
| `PageHeader`    | Consistent page title + optional back-button row              |

### Composable quick-reference

```ts
// useTenant — subdomain slug + workspace lookup
const { slug, isReady, lookup } = useTenant();

// useEntityContext — current entity from global store
const { currentEntity, currentEntityId, isLoading } = useEntityContext();

// useApi — one-off fetch with loading/error/data
const { data, status, error, execute } = useApi(() => invoiceService.list(entityId));

// usePagination — QTable ↔ BE pagination bridge
const { qPagination, meta, setMeta, onRequest } = usePagination({ initialPerPage: 15 });

// useForm — field validation + 422 mapping
const { model, errors, isSubmitting, submit, setServerErrors } = useForm({
  initialValues: { email: '' },
  rules: { email: [v => !!v || 'Required'] },
});

// useEmptyState — derive display discriminant
const displayState = useEmptyState({ loading, error, data });
// displayState.value === 'loading' | 'error' | 'empty' | 'data'
```

---

## Subdomain Testing Locally

| Method | Steps |
|--------|-------|
| **lvh.me** (no config) | Start dev server; visit `http://acme.lvh.me:9000`. `*.lvh.me` resolves to `127.0.0.1` over public DNS. |
| **/etc/hosts** | Add `127.0.0.1 acme.localhost`; visit `http://acme.localhost:9000`. |
| **Cross-device** | Run `quasar dev -H 0.0.0.0`; access via `http://<machine-ip>:9000` with a hosts entry on the target device. |

Reserved subdomains (`www`, `app`, `api`, `admin`) produce no slug and route to the
no-workspace landing page — useful for testing that path without any hosts setup.

---

## Build Modes

| Command | Target |
|---------|--------|
| `quasar dev` | Web SPA (hot-reload) |
| `quasar build` | Production web bundle → `dist/spa/` |
| `quasar dev -m capacitor -T android` | Android dev build |
| `quasar dev -m capacitor -T ios` | iOS dev build (Mac + Xcode required) |
| `quasar build -m capacitor -T android` | Android release build |
| `quasar build -m capacitor -T ios` | iOS release build |

Capacitor plugins initialised in `src/boot/capacitor.ts` (push notifications, status bar,
safe-area insets). On web, these are no-ops.
