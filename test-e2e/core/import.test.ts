import { expect, test } from '@playwright/test';

import NmriumPage from '../NmriumPage/index.js';

test('should load and migrate .nmrium data from version 0 to version 1', async ({
  page,
}) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.dropFile('1h-version-0.nmrium');

  // If the file was loaded successfully, there should be a 1H,1H and 1H tab.
  await expect(
    nmrium.page.locator('_react=Tab[tabid = "1H,1H"]'),
  ).toBeVisible();
  await expect(nmrium.page.locator('_react=Tab[tabid = "1H"]')).toBeVisible();

  await nmrium.page.click('_react=SpectraTabs >> _react=Tab[tabid="1H"]');

  await test.step('check ranges', async () => {
    const ranges = nmrium.page.locator('_react=Range');
    await expect(ranges).toHaveCount(5);
  });
});

test('should load and migrate .nmrium data from version 1 to version 2', async ({
  page,
}) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.dropFile('1h-version-1-datasource.nmrium');

  // If the file was loaded successfully, there should be a 1H,1H and 1H tab.
  await expect(
    nmrium.page.locator('_react=Tab[tabid = "1H,1H"]'),
  ).toBeVisible();
  await expect(nmrium.page.locator('_react=Tab[tabid = "1H"]')).toBeVisible();

  await nmrium.page.click('_react=SpectraTabs >> _react=Tab[tabid="1H"]');

  await test.step('check Peaks', async () => {
    await nmrium.clickPanel('Peaks');
    const peaks = nmrium.page.locator(
      '_react=Peaks[peaksSource="peaks"] >> _react=PeakAnnotation',
    );
    await expect(peaks).toHaveCount(6);
  });

  await test.step('check ranges', async () => {
    const ranges = nmrium.page.locator('_react=Range');
    await expect(ranges).toHaveCount(3);
  });
});
test('should load and migrate .nmrium data from version 2 to version 3', async ({
  page,
}) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.dropFile('13c-version-2.nmrium');

  // If the file was loaded successfully, there should be a 13C tab.
  await expect(nmrium.page.locator('_react=Tab[tabid = "13C"]')).toBeVisible();

  await nmrium.clickPanel('Processings');

  await expect(
    nmrium.page.locator('_react=FiltersSectionsPanel >> text=Apodization'),
  ).toBeVisible();
});
test('should load .nmrium data from version 3', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.dropFile('1h-version-3-1d.nmrium');

  // If the file was loaded successfully, there should be a 13C tab.
  await expect(nmrium.page.locator('_react=Tab[tabid = "1H"]')).toBeVisible();

  await test.step('check Peaks', async () => {
    await nmrium.clickPanel('Peaks');
    const peaks = nmrium.page.locator(
      '_react=Peaks[peaksSource="peaks"] >> _react=PeakAnnotation',
    );
    await expect(peaks).toHaveCount(2);
  });

  await test.step('check integrals', async () => {
    const integrals = nmrium.page.locator(
      '_react=IntegralsSeries >> _react=Integration',
    );
    await expect(integrals).toHaveCount(1);
  });

  await test.step('check ranges', async () => {
    const ranges = nmrium.page.locator('_react=Range');
    await expect(ranges).toHaveCount(2);
  });
});

test('should load and migrate .nmrium data from version 3 to version 4', async ({
  page,
}) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.dropFile('cosy-version-3-2d.nmrium');
  // If the file was loaded successfully, there should be a 1H,1H.
  await expect(
    nmrium.page.locator('_react=Tab[tabid = "1H,1H"]'),
  ).toBeVisible();

  await test.step('check zones', async () => {
    const ranges = nmrium.page.locator('_react=Zone');
    await expect(ranges).toHaveCount(9);
  });
});

test('should load .zip files', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.dropFile('ethylvinylether.zip');

  // If the file was loaded successfully, there should be a 1H tab.
  await expect(nmrium.page.locator('_react=Tab[tabid = "1H"]')).toBeVisible();
});
test('should load multiple files', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.dropFile([
    'ethylvinylether.zip',
    '1h-version-0.nmrium',
    '1h-version-1-datasource.nmrium',
    '13c-version-2.nmrium',
  ]);

  // If the file was loaded successfully, there should be many tabs.
  await expect(nmrium.page.locator('_react=Tab[tabid = "13C"]')).toBeVisible();
});
test('should load file using drag and drop .nmrium', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.dropFile('1h-version-1-datasource.nmrium');
  // If the file was loaded successfully, there should be a 1H,1H tab.
  await expect(
    nmrium.page.locator('_react=Tab[tabid = "1H,1H"]'),
  ).toBeVisible();
});

test('should load file using drag and drop .zip', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.dropFile('ethylvinylether.zip');
  // If the file was loaded successfully, there should be a 1H tab.
  await expect(nmrium.page.locator('_react=Tab[tabid = "1H"]')).toBeVisible();
});
test('should load multiple files using drag and drop', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.dropFile([
    'ethylvinylether.zip',
    '1h-version-0.nmrium',
    '1h-version-1-datasource.nmrium',
    '13c-version-2.nmrium',
  ]);
  // If the file was loaded successfully, there should be many tabs.
  await expect(nmrium.page.locator('_react=Tab[tabid = "13C"]')).toBeVisible();
});
test('should load JCAMP-DX file', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.dropFile('ethylbenzene-1h.jdx');
  // If the file was loaded successfully, there should be many tabs.
  await expect(nmrium.page.locator('_react=Tab[tabid = "1H"]')).toBeVisible();
});
