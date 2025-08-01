import { exportToCSV, exportToJSON } from '../export-utils';

describe('export-utils', () => {
  const data = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
  ];

  describe('exportToCSV', () => {
    it('should convert array of objects to CSV string', () => {
      const csv = exportToCSV(data);
      expect(csv).toContain('name,age');
      expect(csv).toContain('Alice,30');
      expect(csv).toContain('Bob,25');
    });

    it('should handle empty array', () => {
      const csv = exportToCSV([]);
      expect(csv).toBe('');
    });
  });

  describe('exportToJSON', () => {
    it('should convert array of objects to JSON string', () => {
      const json = exportToJSON(data);
      expect(json).toBe(JSON.stringify(data, null, 2));
    });

    it('should handle empty array', () => {
      const json = exportToJSON([]);
      expect(json).toBe(JSON.stringify([], null, 2));
    });
  });
});
