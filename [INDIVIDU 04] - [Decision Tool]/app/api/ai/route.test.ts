import { POST, type RequestBody } from './route';
import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Helper to mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to set env
const setApiKey = (val: string | undefined) => {
  process.env.OPENAI_API_KEY = val;
};

describe('POST /api/ai', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setApiKey('test-key');
  });

  it('returns 500 if OPENAI_API_KEY is missing', async () => {
    setApiKey(undefined);
    // .json should not be called, but if it is, return a dummy object
    const req = { json: vi.fn().mockResolvedValue({}) } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toMatch(/not available/i);
  });

  it('returns error if OpenAI returns error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    const req = { json: vi.fn().mockResolvedValue({ decisionContext: 'foo', method: 'decisionMatrix' }) } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toMatch(/error calling api/i);
  });

  it('returns error if AI response is not valid JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'not json' } }] })
    });
    const req = { json: vi.fn().mockResolvedValue({ decisionContext: 'foo', method: 'decisionMatrix' }) } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.error).toMatch(/parse/i);
    expect(json.raw).toBe('not json');
  });

  it('returns result if AI response is valid JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '{"foo":42}' } }] })
    });
    const req = { json: vi.fn().mockResolvedValue({ decisionContext: 'bar', method: 'decisionMatrix' }) } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result).toEqual({ foo: 42 });
  });
});
