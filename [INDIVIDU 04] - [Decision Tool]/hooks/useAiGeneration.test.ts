import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { useAiGeneration } from './useAiGeneration';
import '@testing-library/jest-dom';

vi.mock('next-intl', () => ({
  useTranslations: () => () => 'mocked',
}));

let mockFetch: any;
beforeAll(() => {
  mockFetch = vi.fn();
  global.fetch = mockFetch;
});

describe('useAiGeneration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should call onAiResult with result when successful', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: 42 })
    });
    const onAiResult = vi.fn();
    const { result } = renderHook(() => useAiGeneration('decisionMatrix', onAiResult));
    await act(async () => {
      await result.current.generateFromContext('context');
    });
    expect(onAiResult).toHaveBeenCalledWith(42);
    expect(result.current.generating).toBe(false);
  });

  it('should handle API error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ error: 'fail' }) });
    const onAiResult = vi.fn();
    const { result } = renderHook(() => useAiGeneration('decisionMatrix', onAiResult));
    await act(async () => {
      await result.current.generateFromContext('context');
    });
    expect(onAiResult).not.toHaveBeenCalled();
    expect(result.current.generating).toBe(false);
  });

  it('should handle network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const onAiResult = vi.fn();
    const { result } = renderHook(() => useAiGeneration('decisionMatrix', onAiResult));
    await act(async () => {
      await result.current.generateFromContext('context');
    });
    expect(onAiResult).not.toHaveBeenCalled();
    expect(result.current.generating).toBe(false);
  });
});
