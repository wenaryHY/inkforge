import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  timeout: 90_000,
  use: {
    baseURL: 'http://127.0.0.1:2002',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'node ./scripts/webServer.cjs',
    url: 'http://127.0.0.1:2002/api/v1/health',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
