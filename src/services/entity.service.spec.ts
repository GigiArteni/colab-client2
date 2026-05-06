import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();

vi.mock('src/boot/axios', () => ({
  api: { get: (url: string, opts?: unknown) => get(url, opts) },
}));

import { entityService } from './entity.service';

describe('entityService', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('getEntities calls /entities and returns data array', async () => {
    const entities = [{ id: '1', name: 'Acme' }];
    get.mockResolvedValueOnce({ data: { data: entities } });

    const result = await entityService.getEntities();

    expect(get.mock.calls[0]![0]).toBe('/entities');
    expect(result).toEqual(entities);
  });

  it('getEntity calls correct endpoint and returns single entity', async () => {
    const entity = { id: '42', name: 'Test Co' };
    get.mockResolvedValueOnce({ data: { data: entity } });

    const result = await entityService.getEntity(42);

    expect(get.mock.calls[0]![0]).toBe('/entities/42');
    expect(result).toEqual(entity);
  });
});
