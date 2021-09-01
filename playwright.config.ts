import { PlaywrightTestConfig } from '@playwright/test';

type BrowserName = 'chromium' | 'firefox' | 'webkit';

const browserName = (process.env.BROWSER || 'chromium') as BrowserName;

const config: PlaywrightTestConfig = {
  testDir: 'test-e2e',
  retries: 0,
  workers: 1,
  use: {
    browserName,
    headless: true,
    viewport: { width: 1280, height: 720 },
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
    command: 'npm run test-e2e-server',
    port: 3000,
    reuseExistingServer: true,
  },
};
export default config;
