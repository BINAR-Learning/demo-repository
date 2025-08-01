import { describe, it, expect } from 'vitest';
import * as toolsConfigModule from '../toolsConfig';

describe('toolsConfig', () => {
  it('should be a module (object)', () => {
    expect(typeof toolsConfigModule).toBe('object');
  });
});
