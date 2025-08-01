
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      all: true,
      skipFull: false,
      ignoreEmptyLines: true,
      reportOnFailure: true,
      include: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        'i18n/**/*.{ts,tsx}',
      ],
      exclude: [
        'node_modules/**',
        'coverage/**',
        'dist/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/__tests__/**',
        'test/**',
        '.next/**',
        '**/*.config.*',
        '**/*.d.ts',
        '**/layout.tsx',
        '**/globals.css',
        'app/**/loading.tsx',
        'app/**/not-found.tsx',
        'app/**/error.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
