import { defineConfig, devices } from '@playwright/test'

/**
 * Browser tests (SSR -> hydration, visual matrix) arrive in phase 2.
 * The base URL comes from the environment so the dev-server ledger, not this
 * file, decides which server is measured.
 */
export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.MDXCN_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
