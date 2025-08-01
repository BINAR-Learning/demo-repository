import { describe, it, expect } from 'vitest';
import * as settings from '../settings';
import * as request from '../request';

describe('i18n/settings', () => {
  it('should export locales array', () => {
    expect(Array.isArray(settings.locales)).toBe(true);
  });
  it('should export defaultLocale', () => {
    expect(typeof settings.defaultLocale).toBe('string');
  });
});
