import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as cookies from '../cookies';

describe('cookies', () => {
  beforeEach(() => {
    let cookieStore = '';
    vi.stubGlobal('document', {
      get cookie() {
        return cookieStore;
      },
      set cookie(val) {
        cookieStore = val;
      }
    });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  it('should set and get cookies', () => {
    cookies.setCookie('test', 'value', 1);
    expect(document.cookie).toContain('test=value');
    expect(cookies.getCookie('test')).toBe('value');
  });
});
