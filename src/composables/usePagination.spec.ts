import { describe, it, expect, vi } from 'vitest';
import { usePagination } from './usePagination';
import type { PaginationMeta } from 'src/types';

const makeMeta = (overrides: Partial<PaginationMeta> = {}): PaginationMeta => ({
  current_page: 1,
  from: 1,
  last_page: 5,
  per_page: 15,
  to: 15,
  total: 75,
  ...overrides,
});

describe('usePagination', () => {
  it('initialises with defaults', () => {
    const { page, perPage, total } = usePagination();
    expect(page.value).toBe(1);
    expect(perPage.value).toBe(15);
    expect(total.value).toBe(0);
  });

  it('respects initialPage and initialPerPage options', () => {
    const { page, perPage } = usePagination({ initialPage: 3, initialPerPage: 25 });
    expect(page.value).toBe(3);
    expect(perPage.value).toBe(25);
  });

  it('setMeta updates all pagination values', () => {
    const { page, perPage, total, lastPage, from, to, setMeta } = usePagination();
    setMeta(makeMeta());
    expect(page.value).toBe(1);
    expect(perPage.value).toBe(15);
    expect(total.value).toBe(75);
    expect(lastPage.value).toBe(5);
    expect(from.value).toBe(1);
    expect(to.value).toBe(15);
  });

  it('nextPage increments page and calls onChange', () => {
    const onChange = vi.fn();
    const { page, nextPage, setMeta } = usePagination({ onChange });
    setMeta(makeMeta());
    nextPage();
    expect(page.value).toBe(2);
    expect(onChange).toHaveBeenCalledWith(2, 15);
  });

  it('nextPage is a no-op on last page', () => {
    const onChange = vi.fn();
    const { page, nextPage, setMeta } = usePagination({ onChange });
    setMeta(makeMeta({ current_page: 5 }));
    nextPage();
    expect(page.value).toBe(5);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('prevPage decrements page', () => {
    const { page, prevPage, setMeta } = usePagination();
    setMeta(makeMeta({ current_page: 3 }));
    prevPage();
    expect(page.value).toBe(2);
  });

  it('prevPage is a no-op on page 1', () => {
    const onChange = vi.fn();
    const { page, prevPage } = usePagination({ onChange });
    prevPage();
    expect(page.value).toBe(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('setPerPage resets to page 1 and calls onChange', () => {
    const onChange = vi.fn();
    const { page, perPage, setPerPage, setMeta } = usePagination({ onChange });
    setMeta(makeMeta({ current_page: 4 }));
    setPerPage(25);
    expect(page.value).toBe(1);
    expect(perPage.value).toBe(25);
    expect(onChange).toHaveBeenCalledWith(1, 25);
  });

  it('qTablePagination reflects current state', () => {
    const { qTablePagination, setMeta } = usePagination();
    setMeta(makeMeta({ current_page: 2, per_page: 15, total: 75 }));
    expect(qTablePagination.value).toEqual({
      page: 2,
      rowsPerPage: 15,
      rowsNumber: 75,
    });
  });

  it('onQTableRequest updates state and calls onChange', () => {
    const onChange = vi.fn();
    const { page, perPage, onQTableRequest, setMeta } = usePagination({ onChange });
    setMeta(makeMeta());
    onQTableRequest({ pagination: { page: 3, rowsPerPage: 15, rowsNumber: 75 } });
    expect(page.value).toBe(3);
    expect(onChange).toHaveBeenCalledWith(3, 15);

    // perPage change resets to page 1
    onQTableRequest({ pagination: { page: 3, rowsPerPage: 25, rowsNumber: 75 } });
    expect(page.value).toBe(1);
    expect(perPage.value).toBe(25);
  });
});
