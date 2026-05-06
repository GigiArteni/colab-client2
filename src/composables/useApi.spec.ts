import { describe, it, expect, vi, afterEach } from 'vitest';
import { useApi } from './useApi';

describe('useApi', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with idle status and null data', () => {
    const { data, loading, error, status } = useApi(() => Promise.resolve('ok'));
    expect(data.value).toBeNull();
    expect(loading.value).toBe(false);
    expect(error.value).toBeNull();
    expect(status.value).toBe('idle');
  });

  it('sets loading during execution and resolves data on success', async () => {
    const fn = vi.fn().mockResolvedValue({ id: 1 });
    const { data, loading, status, execute } = useApi(fn);

    const promise = execute();
    expect(loading.value).toBe(true);

    await promise;

    expect(loading.value).toBe(false);
    expect(status.value).toBe('success');
    expect(data.value).toEqual({ id: 1 });
  });

  it('captures error and sets status to error on rejection', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('network fail'));
    const { error, status, execute } = useApi(fn);

    await execute();

    expect(status.value).toBe('error');
    expect(error.value?.message).toBe('network fail');
  });

  it('calls onSuccess callback with resolved data', async () => {
    const onSuccess = vi.fn();
    const fn = vi.fn().mockResolvedValue('result');
    const { execute } = useApi(fn, { onSuccess });

    await execute();

    expect(onSuccess).toHaveBeenCalledWith('result');
  });

  it('calls onError callback on rejection', async () => {
    const onError = vi.fn();
    const fn = vi.fn().mockRejectedValue(new Error('boom'));
    const { execute } = useApi(fn, { onError });

    await execute();

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0]?.[0]?.message).toBe('boom');
  });

  it('retry re-runs the request', async () => {
    const fn = vi.fn().mockResolvedValue('data');
    const { retry } = useApi(fn);

    await retry();
    await retry();

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('abort sets status back to idle without error when fn respects the signal', async () => {
    // fn must reject with AbortError when the signal fires for abort to work
    const fn = vi.fn(
      (signal: AbortSignal) =>
        new Promise<string>((_resolve, reject) => {
          signal.addEventListener('abort', () => {
            const err = new Error('Aborted');
            err.name = 'AbortError';
            reject(err);
          });
        })
    );

    const { status, execute, abort } = useApi(fn);

    const p = execute();
    abort();
    await p;

    expect(status.value).toBe('idle');
  });
});
