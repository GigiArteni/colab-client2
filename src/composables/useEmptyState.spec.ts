import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useEmptyState } from './useEmptyState';

describe('useEmptyState', () => {
  it('displayState is loading when loading=true regardless of data', () => {
    const { displayState } = useEmptyState({
      loading: ref(true),
      error: ref(null),
      data: ref([1, 2, 3]),
    });
    expect(displayState.value).toBe('loading');
  });

  it('displayState is error when loading=false and error is set', () => {
    const { displayState, isError } = useEmptyState({
      loading: ref(false),
      error: ref(new Error('fail')),
      data: ref(null),
    });
    expect(displayState.value).toBe('error');
    expect(isError.value).toBe(true);
  });

  it('displayState is empty for null data', () => {
    const { displayState, isEmpty } = useEmptyState({
      loading: ref(false),
      error: ref(null),
      data: ref(null),
    });
    expect(displayState.value).toBe('empty');
    expect(isEmpty.value).toBe(true);
  });

  it('displayState is empty for empty array', () => {
    const { displayState } = useEmptyState({
      loading: ref(false),
      error: ref(null),
      data: ref([]),
    });
    expect(displayState.value).toBe('empty');
  });

  it('displayState is data for non-empty array', () => {
    const { displayState, hasData } = useEmptyState({
      loading: ref(false),
      error: ref(null),
      data: ref([1]),
    });
    expect(displayState.value).toBe('data');
    expect(hasData.value).toBe(true);
  });

  it('error state takes priority over empty state', () => {
    const { displayState } = useEmptyState({
      loading: ref(false),
      error: ref('some error'),
      data: ref(null),
    });
    expect(displayState.value).toBe('error');
  });

  it('custom isEmpty override is respected', () => {
    const { displayState } = useEmptyState({
      loading: ref(false),
      error: ref(null),
      data: ref({ items: [] }),
      isEmpty: (d) => d.items.length === 0,
    });
    expect(displayState.value).toBe('empty');
  });

  it('isEmpty is false when loading (no false positives during fetch)', () => {
    const { isEmpty } = useEmptyState({
      loading: ref(true),
      error: ref(null),
      data: ref([]),
    });
    expect(isEmpty.value).toBe(false);
  });
});
