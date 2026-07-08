import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  projects: [
    /* Test against desktop browsers */
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    /*{
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },*/
    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 8'] }
    }
    /*
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }*/
  ],
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/frontend-e2e.xml' }]
  ],
  retries: process.env.CI ? 2 : 0,
  testMatch: 'src/tests/e2e/**/*.{test,spec}.{js,ts}',
  use: { baseURL: 'http://localhost:4173', screenshot: 'on' },
  webServer: {
    command: 'npm run preview',
    port: 4173
  }
});
