import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [['junit', { outputFile: 'e2e-results.xml' }], ['html', { open: 'never' }]]
    : [['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },
    {
      name: 'pro-setup',
      testMatch: /pro-auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: '**/pro-*.spec.ts',
    },
    {
      name: 'pro-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/pro.json',
      },
      dependencies: ['pro-setup'],
      testMatch: '**/pro-*.spec.ts',
    },
  ],
})
