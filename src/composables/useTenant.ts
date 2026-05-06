/**
 * useTenant — single source of truth for the current tenant slug.
 *
 * Slug is derived from `window.location.hostname` (subdomain-based routing).
 * Customers reach the portal via `<slug>.colab-client.app`; the API uses
 * the same convention or accepts `tenant: <slug>` in the request body as a
 * fallback. Reserved subdomains (`www`, `app`, `api`, `admin`, `localhost`)
 * resolve to `null` so the apex domain shows the no-workspace landing.
 *
 * No localStorage persistence — the URL is the source of truth on every
 * navigation. No `setSlug()` — slug is immutable for the session.
 */

import { computed, ref } from 'vue';
import axios from 'axios';

const RESERVED_HOST_SEGMENTS = new Set([
  'www',
  'app',
  'api',
  'admin',
  'mail',
  'static',
  'cdn',
  'assets',
  'localhost',
]);

const SUBDOMAIN_PATTERN = /^[a-z0-9-]{1,63}$/;

export type WorkspaceStatus = 'active' | 'suspended' | 'archived' | 'pending' | (string & {});

export interface WorkspaceLookupResult {
  exists: boolean;
  status?: WorkspaceStatus;
  display_name?: string;
}

/**
 * Extract the workspace slug from a hostname.
 *
 * Rules:
 * - `acme.colab-client.app`     → 'acme'
 * - `acme.lvh.me`               → 'acme'  (dev convenience)
 * - `acme.localhost`            → 'acme'  (with /etc/hosts)
 * - `colab-client.app`          → null    (apex, 2-segment public domain)
 * - `localhost`                 → null    (bare)
 * - `www.colab-client.app`      → null    (reserved)
 * - `app.colab-client.app`      → null    (reserved)
 * - `127.0.0.1` / `192.168.x.x` → null    (raw IP)
 *
 * Exported for unit testing.
 */
export function parseSlugFromHostname(hostname: string | null | undefined): string | null {
  if (!hostname) return null;

  let host = hostname.trim().toLowerCase();
  if (host.length === 0) return null;

  // Strip port if present (`acme.localhost:9000`).
  if (host.includes(':')) {
    const idx = host.indexOf(':');
    host = host.slice(0, idx);
  }

  // Bare localhost / single-segment hosts have no subdomain.
  if (!host.includes('.')) return null;

  // Raw IPv4.
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return null;

  const segments = host.split('.');
  if (segments.length < 2) return null;

  const first = segments[0]!;
  if (RESERVED_HOST_SEGMENTS.has(first)) return null;
  if (!SUBDOMAIN_PATTERN.test(first)) return null;

  // For 2-segment hosts only `<slug>.localhost` is treated as a subdomain;
  // an apex like `colab-client.app` should resolve to null (no slug).
  if (segments.length === 2) {
    const last = segments[1]!;
    return last === 'localhost' ? first : null;
  }

  return first;
}

function readSlug(): string | null {
  if (typeof window === 'undefined') return null;
  return parseSlugFromHostname(window.location?.hostname ?? null);
}

const slug = ref<string | null>(readSlug());
const lookupResult = ref<WorkspaceLookupResult | null>(null);
const lookupLoading = ref(false);

const API_URL = process.env.API_URL || 'http://localhost:8002/v1';

async function lookup(): Promise<WorkspaceLookupResult> {
  const candidate = slug.value;
  if (!candidate) {
    const empty: WorkspaceLookupResult = { exists: false };
    lookupResult.value = empty;
    return empty;
  }

  lookupLoading.value = true;
  try {
    const { data } = await axios.get<{ data: WorkspaceLookupResult }>(
      `${API_URL}/workspaces/${encodeURIComponent(candidate)}`,
    );
    const payload = data?.data ?? { exists: false };
    lookupResult.value = payload;
    return payload;
  } catch {
    const fallback: WorkspaceLookupResult = { exists: false };
    lookupResult.value = fallback;
    return fallback;
  } finally {
    lookupLoading.value = false;
  }
}

const isReady = computed(
  () =>
    slug.value !== null &&
    lookupResult.value?.exists === true &&
    lookupResult.value.status === 'active',
);

/**
 * For BE error handlers that need to invalidate the cached lookup
 * (e.g. mid-session tenant_inactive). The slug itself is not user-mutable —
 * it stays bound to the hostname.
 */
function invalidate(): void {
  lookupResult.value = null;
}

/**
 * Test-only seam. Re-reads `window.location.hostname` and recomputes slug.
 * Production code never needs this — slug is set once at module load.
 */
function refreshFromHostname(): void {
  slug.value = readSlug();
  lookupResult.value = null;
}

export function useTenant() {
  return {
    slug,
    lookupResult,
    lookupLoading,
    isReady,
    lookup,
    invalidate,
    refreshFromHostname,
  };
}
