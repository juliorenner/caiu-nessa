import { defineConfig, devices } from '@playwright/test'

// Sem E2E_BASE_URL: sobe o build local (`next build` antes) com PGlite em disco.
// Com E2E_BASE_URL: roda contra o site já publicado (use E2E_SOMENTE_LEITURA=1 em produção).
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3100'

export default defineConfig({
  testDir: './tests/e2e',
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: {
    baseURL,
    viewport: { width: 390, height: 844 },
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npx next start -p 3100',
        url: 'http://localhost:3100',
        reuseExistingServer: !process.env.CI,
        env: {
          DATABASE_URL: 'file:.pglite-e2e',
          IP_HASH_SALT: 'e2e',
          NEXT_PUBLIC_SITE_URL: 'http://localhost:3100',
        },
        timeout: 120_000,
      },
})
