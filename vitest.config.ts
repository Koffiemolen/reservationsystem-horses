import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'horse-reservation-system',
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        '.next/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/migrations/',
        'prisma/',
        'src/app/**/layout.tsx',
        'src/app/**/page.tsx',
        'src/components/ui/**', // shadcn/ui components
        'src/app/(showcase)/**', // Design showcase
      ],
      all: true,
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
    },
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', '.next', 'dist', 'coverage', 'e2e'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
