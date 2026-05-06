/**
 * Tenant-level test configuration.
 *
 * Playwright does not support dynamic DNS; instead we rely on `lvh.me`
 * which resolves to 127.0.0.1 at any subdomain depth.
 *
 * Usage in a spec:
 *   test.use({ baseURL: TENANT_BASE_URL });
 *
 * Then in the test body navigate with `page.goto('/')` and the browser
 * will hit `http://acme.lvh.me:9000/` — `useTenant()` will parse 'acme'
 * from the hostname.
 */

export const DEV_PORT = 9000;

/** Tenant subdomain used across auth + layout tests. */
export const TENANT_SLUG = 'acme';

/** Full base URL for the tenant subdomain. */
export const TENANT_BASE_URL = `http://${TENANT_SLUG}.lvh.me:${DEV_PORT}`;

/** Apex domain (no subdomain) — resolves to NoWorkspaceLandingPage. */
export const APEX_BASE_URL = `http://lvh.me:${DEV_PORT}`;

/** Unknown subdomain — resolves to UnknownWorkspacePage. */
export const UNKNOWN_BASE_URL = `http://unknown-xyz.lvh.me:${DEV_PORT}`;

/** A second tenant slug used for entity-switcher multi-entity tests. */
export const TENANT_SLUG_2 = 'beta';
