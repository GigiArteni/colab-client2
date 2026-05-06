/**
 * useTenant — hostname → slug parsing + lookup state.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { parseSlugFromHostname } from './useTenant';

vi.mock('axios');

async function loadFresh() {
  vi.resetModules();
  return await import('./useTenant');
}

function setHost(host: string): void {
  const url = `http://${host}/`;
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: new URL(url),
    writable: true,
  });
}

describe('parseSlugFromHostname', () => {
  it.each([
    ['acme.colab-client.app', 'acme'],
    ['ACME.colab-client.app', 'acme'],
    ['acme.lvh.me', 'acme'],
    ['acme.localhost', 'acme'],
    ['acme.localhost:9000', 'acme'],
    ['multi-word-tenant.colab-client.app', 'multi-word-tenant'],
  ])('extracts slug from %s', (host, expected) => {
    expect(parseSlugFromHostname(host)).toBe(expected);
  });

  it.each([
    ['colab-client.app', null],
    ['localhost', null],
    ['localhost:9000', null],
    ['127.0.0.1', null],
    ['192.168.1.5', null],
    ['www.colab-client.app', null],
    ['app.colab-client.app', null],
    ['api.colab-client.app', null],
    ['admin.colab-client.app', null],
    ['', null],
    [null, null],
    [undefined, null],
  ])('returns null for %s', (host, expected) => {
    expect(parseSlugFromHostname(host)).toBe(expected);
  });

  it('rejects invalid characters in subdomain', () => {
    expect(parseSlugFromHostname('Foo_Bar.colab-client.app')).toBeNull();
    expect(parseSlugFromHostname('foo bar.colab-client.app')).toBeNull();
  });

  it('handles port suffix on subdomain hosts', () => {
    expect(parseSlugFromHostname('acme.lvh.me:9000')).toBe('acme');
  });
});

describe('useTenant module state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    setHost('localhost');
  });

  it('reads slug from hostname on init', async () => {
    setHost('acme.lvh.me');
    const mod = await loadFresh();
    const { slug } = mod.useTenant();
    expect(slug.value).toBe('acme');
  });

  it('slug is null on apex / reserved hosts', async () => {
    setHost('localhost');
    const mod = await loadFresh();
    const { slug } = mod.useTenant();
    expect(slug.value).toBeNull();
  });

  it('lookup() returns BE payload on success', async () => {
    setHost('acme.lvh.me');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { data: { exists: true, status: 'active', display_name: 'acme' } },
    });
    const mod = await loadFresh();
    const tenant = mod.useTenant();
    const result = await tenant.lookup();
    expect(result).toEqual({ exists: true, status: 'active', display_name: 'acme' });
    expect(tenant.lookupResult.value).toEqual(result);
  });

  it('lookup() short-circuits when slug is null', async () => {
    setHost('localhost');
    const mod = await loadFresh();
    const tenant = mod.useTenant();
    const result = await tenant.lookup();
    expect(result).toEqual({ exists: false });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(vi.mocked(axios.get)).not.toHaveBeenCalled();
  });

  it('lookup() falls back to {exists: false} on network failure', async () => {
    setHost('acme.lvh.me');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('boom'));
    const mod = await loadFresh();
    const tenant = mod.useTenant();
    const result = await tenant.lookup();
    expect(result).toEqual({ exists: false });
  });

  it('isReady is true only when slug is set AND lookup is exists+active', async () => {
    setHost('acme.lvh.me');
    const mod = await loadFresh();
    const tenant = mod.useTenant();
    expect(tenant.isReady.value).toBe(false);

    tenant.lookupResult.value = { exists: true, status: 'suspended' };
    expect(tenant.isReady.value).toBe(false);

    tenant.lookupResult.value = { exists: true, status: 'active' };
    expect(tenant.isReady.value).toBe(true);
  });

  it('invalidate() clears the cached lookup but leaves slug intact', async () => {
    setHost('acme.lvh.me');
    const mod = await loadFresh();
    const tenant = mod.useTenant();
    tenant.lookupResult.value = { exists: true, status: 'active' };
    tenant.invalidate();
    expect(tenant.lookupResult.value).toBeNull();
    expect(tenant.slug.value).toBe('acme');
  });
});
