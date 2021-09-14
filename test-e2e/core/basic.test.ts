import { test, expect } from '@playwright/test';

import NmriumPage from '../NmriumPage';

test('should load and display the 1D spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  expect(await nmrium.page.title()).toBe('NMRium');
  await nmrium.open1D();
  // There should be a big path depicting the spectrum.
  const path = (await nmrium.page.getAttribute(
    '#nmrSVG path.line',
    'd',
  )) as string;
  expect(path.length).toBeGreaterThan(1000);
  expect(path).not.toContain('NaN');
});
