import { describe, it, expect } from 'vitest';
import * as consts from '../consts';

describe('consts', () => {
  it('should have localStorageKeys array', () => {
    expect(Array.isArray(consts.localStorageKeys)).toBe(true);
  });
  // Add more tests for each exported constant
});
