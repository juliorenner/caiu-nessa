import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/setup.ts'],
    // tests/e2e/** é do Playwright (npm run e2e).
    exclude: [...configDefaults.exclude, 'tests/e2e/**'],
    // Com paralelismo total, as instâncias de PGlite estouram o timeout de 5 s.
    maxWorkers: 2,
  },
})
