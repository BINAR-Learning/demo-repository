

export function exportToCSV(data: any[]): string {
  if (!data || !data.length) return '';
  const keys = Object.keys(data[0]);
  const csvRows = [keys.join(',')];
  for (const row of data) {
    csvRows.push(keys.map(k => {
      const val = row[k] ?? '';
      // Only quote if value contains comma, quote, or newline
      if (typeof val === 'string' && /[",\n]/.test(val)) {
        return '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    }).join(','));
  }
  return csvRows.join('\n');
}

export function exportToJSON(data: any[]): string {
  return JSON.stringify(data, null, 2);
}
