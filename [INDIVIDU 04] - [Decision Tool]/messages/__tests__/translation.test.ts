import { describe, it, expect } from 'vitest';
import en from '../en.json';
import id from '../id.json';

function getAllKeys(obj: Record<string, any>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const fullKey = prefix ? `${prefix}.${key}` : key;
      keys.push(fullKey);
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys = keys.concat(getAllKeys(value, fullKey));
      }
    }
  }
  return keys;
}

describe('translation files', () => {
  it('should have the same nested keys in all languages', () => {
    const enKeys = getAllKeys(en);
    const idKeys = getAllKeys(id);
    expect(enKeys.sort()).toEqual(idKeys.sort());
  });
});
