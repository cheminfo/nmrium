import { test, expect } from '@playwright/test';

import NmriumPage from '../NmriumPage';

test('should load and display the 1D and 2D spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  expect(await nmrium.page.title()).toBe('NMRium');

  await nmrium.page.click('li >> text=General');
  await nmrium.page.click('li >> text=FULL ethylbenzene');

  //switch to 1d
  await nmrium.page.click('_react=InternalTab[tabid="1H"]');

  const path = (await nmrium.page.getAttribute(
    '#nmrSVG path.line ',
    'd',
  )) as string;
  expect(path.length).toBeGreaterThan(1000);
  expect(path).not.toContain('NaN');

  //switch to 2d
  await nmrium.page.click('_react=InternalTab[tabid="1H,1H"]');

  const spectrumLineLocator = nmrium.page.locator(
    'data-test-id=spectrum-line >> nth=0',
  );

  await expect(spectrumLineLocator).toBeVisible();
});

test('check callbacks count', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);

  await nmrium.page.click('li >> text=Test');
  await nmrium.page.click('li >> text=Full cytisine');

  // wait the spectrum to load
  await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();

  const dataCount = nmrium.page.locator('[data-test-id="data-count"]');
  const viewCount = nmrium.page.locator('[data-test-id="view-count"]');

  await expect(dataCount).toContainText('3');
  await expect(viewCount).toContainText('3');

  //test to 1d
  const path = (await nmrium.page.getAttribute(
    '#nmrSVG path.line ',
    'd',
  )) as string;
  expect(path.length).toBeGreaterThan(1000);
  expect(path).not.toContain('NaN');

  //switch to 2d
  await nmrium.page.click('_react=InternalTab[tabid="1H,1H"]');

  await expect(dataCount).toContainText('3');
  await expect(viewCount).toContainText('5');

  const spectrumLineLocator = nmrium.page.locator(
    'data-test-id=spectrum-line >> nth=0',
  );

  await expect(spectrumLineLocator).toBeVisible();
});
