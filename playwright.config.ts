import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Maximum time one test can run for
  timeout: 60 * 1000,
  expect: {
    // Maximum time expect() should wait for the condition to be met
    timeout: 10000
  },
  // Run tests in files in parallel
  fullyParallel: true,
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  // Reporter to use
  reporter: [
    ['list'],
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.CRYSTAL_WEB_URL || 'http://localhost:4521',
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    // Record video on failure
    video: 'retain-on-failure',
    // Global timeout for actions
    actionTimeout: 10000,
    // Global timeout for navigation
    navigationTimeout: 30000,
  },

  // Configure projects for major browsers
  projects: [
    // Desktop Electron tests (existing)
    {
      name: 'electron-desktop',
      testMatch: /.*\.spec\.ts$/,
      testIgnore: /.*e2e.*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4521',
      },
    },

    // Web server E2E tests (new)
    {
      name: 'web-server-chrome',
      testMatch: /.*e2e.*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.CRYSTAL_WEB_URL || 'http://localhost:3001',
      },
    },

    {
      name: 'web-server-firefox',
      testMatch: /.*e2e.*\.spec\.ts$/,
      use: {
        ...devices['Desktop Firefox'],
        baseURL: process.env.CRYSTAL_WEB_URL || 'http://localhost:3001',
      },
    },

    // Mobile web server tests
    {
      name: 'web-server-mobile',
      testMatch: /.*e2e.*\.spec\.ts$/,
      use: {
        ...devices['Pixel 5'],
        baseURL: process.env.CRYSTAL_WEB_URL || 'http://localhost:3001',
      },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: [
    // Electron dev server for desktop tests
    {
      command: 'pnpm electron-dev',
      port: 4521,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    // Note: Web server tests expect Crystal to be running separately on port 3001
    // Start Crystal with web server enabled before running e2e tests
  ],
});