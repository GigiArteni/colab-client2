/**
 * Tenant Boot File
 *
 * On app start, validate the workspace slug parsed from `window.location.hostname`
 * against the public BE endpoint. Three outcomes:
 *
 * 1. **Apex / no subdomain** (`slug === null`)
 *    → if not already on an `allowsNoTenant` route, redirect to `/auth/no-workspace`.
 *
 * 2. **Subdomain present + workspace exists+active**
 *    → no-op; the rest of the app boots normally and `useTenant().isReady` is true.
 *
 * 3. **Subdomain present + lookup says missing/inactive/archived/suspended**
 *    → redirect to `/auth/unknown-workspace`.
 *
 * Runs once at app boot. The mid-session axios interceptor re-routes if the
 * tenant becomes inactive while the user is logged in.
 *
 * Registered in `quasar.config.ts` BEFORE `axios` so authenticated requests
 * never fire against an unresolved tenant.
 */

import { defineBoot } from '#q-app/wrappers';
import { useTenant } from 'src/composables/useTenant';

export default defineBoot(async ({ router }) => {
  const tenant = useTenant();

  if (typeof window === 'undefined') return;

  const path = window.location.pathname;
  const isOnNoTenantRoute =
    path.includes('/auth/no-workspace') || path.includes('/auth/unknown-workspace');

  if (tenant.slug.value === null) {
    if (!isOnNoTenantRoute) {
      await router.replace({ path: '/auth/no-workspace' });
    }
    return;
  }

  const result = await tenant.lookup();
  if (!result.exists || result.status !== 'active') {
    if (!isOnNoTenantRoute) {
      const reason = !result.exists
        ? 'tenant_unknown'
        : result.status === 'suspended'
          ? 'tenant_inactive'
          : result.status === 'archived'
            ? 'tenant_archived'
            : 'tenant_unavailable';
      await router.replace({
        path: '/auth/unknown-workspace',
        query: { reason },
      });
    }
  }
});
