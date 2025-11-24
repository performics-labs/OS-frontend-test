import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 *
 * This configuration supports both real backend integration tests and
 * MSW-mocked isolated tests via the hybrid testing approach.
 *
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Maximum time one test can run
  timeout: 30 * 1000,

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
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    process.env.CI ? ['github'] : null,
  ].filter(Boolean) as any,

  // Shared settings for all the projects below
  use: {
    // Base URL for tests
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5000',

    // Collect trace on first retry
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on first retry
    video: 'retain-on-failure',

    // Maximum time each action can take
    actionTimeout: 10 * 1000,

    // Navigation timeout
    navigationTimeout: 15 * 1000,
  },

  // Configure projects for different test scenarios
  projects: [
    // Setup project to authenticate once and save state
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Tests that require authentication
    {
      name: 'chromium-authenticated',
      use: {
        ...devices['Desktop Chrome'],
        // Use prepared auth state
        storageState: 'tests/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: /auth\/.*/,  // Skip auth tests as they don't need pre-auth
    },

    // Tests that don't require authentication (login, public pages)
    {
      name: 'chromium-public',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: /auth\/.*/,  // Only run auth tests
    },

    // Smoke tests with MSW mocks (fast, isolated)
    {
      name: 'chromium-smoke',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: /smoke\/.*/,
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
