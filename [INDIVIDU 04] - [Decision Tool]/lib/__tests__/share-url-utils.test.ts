import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as utils from '../utils';

// Mock window and location for createShareUrl
const originalWindow = global.window;

describe('createShareUrl', () => {
  beforeEach(() => {
    // @ts-ignore
    global.window = Object.create(window);
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost', pathname: '/test' },
      writable: true,
    });
  });
  afterEach(() => {
    global.window = originalWindow;
  });
  it('should create a share url with compressed data', () => {
    const url = utils.createShareUrl({ foo: 'bar' });
    expect(url).toContain('http://localhost/test?lz=1&data=');
  });
  it('should return empty string if window is undefined', () => {
    // @ts-ignore
    delete global.window;
    expect(utils.createShareUrl({ foo: 'bar' })).toBe('');
  });
});

describe('getDataByTool', () => {
  beforeEach(() => {
    // @ts-ignore
    global.window = Object.create(window);
    global.localStorage = {
      getItem: vi.fn(() => JSON.stringify({ foo: 'bar' })),
    } as any;
  });
  afterEach(() => {
    global.window = originalWindow;
  });
  it('should get data from localStorage', () => {
    expect(utils.getDataByTool('decisionMatrix')).toEqual({ foo: 'bar' });
  });
  it('should return empty object if no data', () => {
    (global.localStorage.getItem as any).mockReturnValueOnce(null);
    expect(utils.getDataByTool('decisionMatrix')).toEqual({});
  });
});
