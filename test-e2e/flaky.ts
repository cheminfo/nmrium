import type { TestInfo } from '@playwright/test';

const isCI =
  Boolean(process.env.CI) &&
  process.env.CI !== 'false' &&
  process.env.CI !== '0';

/**
 * Mark a test as flaky
 * Inspired by https://github.com/microsoft/playwright/issues/27653#issuecomment-3775359315
 * @param info
 * @param reason
 */
export function flaky(reason: string, info: TestInfo) {
  info.skip(
    isCI && info.retry > 0,
    `Flaky test - retrying to not block CI - ${reason}`,
  );
}
