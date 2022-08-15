import { PlaywrightTestConfig, devices, ViewportSize } from '@playwright/test';

const viewportOverride: ViewportSize = {
  width: 1600,
  height: 900,
};

const config: PlaywrightTestConfig = {
  testDir: 'test-e2e',
  retries: 0,
  workers: 1,
  use: {
    headless: true,
    ignoreHTTPSErrors: true,
    // video: 'on-first-retry',
    launchOptions: {
      // slowMo: 250,
    },
    contextOptions: {
      strictSelectors: true,
    },
  },
  webServer: {
    command: process.env.CI
      ? 'npm run test-e2e-server'
      : 'npm run dev -- --no-open',
    port: 3000,
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: viewportOverride,
        permissions: ['clipboard-read', 'clipboard-write'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: viewportOverride,
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: viewportOverride,
      },
    },
  ],
};

export default config;
