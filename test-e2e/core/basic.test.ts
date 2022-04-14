import { test, expect } from '@playwright/test';

import NmriumPage from '../NmriumPage';

test('should load and display the 1D and 2D spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  expect(await nmrium.page.title()).toBe('NMRium');

  await nmrium.page.click('li >> text=General');
  await nmrium.page.click('li >> text=FULL ethylbenzene');

  //switch to 1d
  await nmrium.page.click('data-test-id=tab-1H');

  const path = (await nmrium.page.getAttribute(
    '#nmrSVG path.line ',
    'd',
  )) as string;
  expect(path.length).toBeGreaterThan(1000);
  expect(path).not.toContain('NaN');

  //switch to 2d
  await nmrium.page.click('data-test-id=tab-1H,1H');

  const spectrumLineLocator = nmrium.page.locator(
    'data-test-id=spectrum-line >> nth=0',
  );

  await expect(spectrumLineLocator).toBeVisible();
});
