import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock laravel-echo and pusher-js before any imports
vi.mock('laravel-echo', () => ({
  default: vi.fn().mockImplementation(() => ({
    channel: vi.fn().mockReturnValue({
      listen: vi.fn().mockReturnThis(),
      stopListening: vi.fn().mockReturnThis(),
    }),
    private: vi.fn().mockReturnValue({
      listen: vi.fn().mockReturnThis(),
      stopListening: vi.fn().mockReturnThis(),
    }),
    leave: vi.fn(),
    disconnect: vi.fn(),
    connector: { pusher: { connection: { state: 'connected' } } },
  })),
}));

vi.mock('pusher-js', () => ({ default: vi.fn() }));

vi.mock('src/boot/axios', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

vi.mock('quasar', () => ({
  LocalStorage: { getItem: vi.fn(() => null), set: vi.fn(), remove: vi.fn() },
}));

vi.mock('src/composables/useTenant', () => ({
  useTenant: () => ({ slug: { value: 'acme' } }),
}));

import { useEcho } from './useEcho';

describe('useEcho', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns isConnected ref', () => {
    const { isConnected } = useEcho();
    expect(typeof isConnected.value).toBe('boolean');
  });

  it('subscribe and unsubscribe are functions', () => {
    const { subscribe, unsubscribe } = useEcho();
    expect(typeof subscribe).toBe('function');
    expect(typeof unsubscribe).toBe('function');
  });

  it('unsubscribe does not throw for unknown channel', () => {
    const { unsubscribe } = useEcho();
    expect(() => unsubscribe('unknown-channel')).not.toThrow();
  });
});
