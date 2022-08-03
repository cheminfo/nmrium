import { test, expect } from '@playwright/test';

import NmriumPage from '../NmriumPage';

async function open13CFidSpectrum(nmrium: NmriumPage) {
  await nmrium.page.click('li >> text=General');
  await nmrium.page.click('li >> text=13C Spectrum >> nth=0');
}

async function apodizationFilter(nmrium: NmriumPage) {
  await nmrium.clickTool('apodization');
  await nmrium.page.click('button >> text=Apply');

  await expect(
    nmrium.page.locator('data-test-id=filters-table >> text=Apodization'),
  ).toBeVisible();
}

async function zeroFillingFilter(nmrium: NmriumPage) {
  await nmrium.clickTool('zeroFilling');
  await nmrium.page.click('button >> text=Apply');

  await expect(
    nmrium.page.locator('data-test-id=filters-table >> text=Zero Filling'),
  ).toBeVisible();
}

async function fourierTransformFilter(nmrium: NmriumPage) {
  await nmrium.clickTool('fft');

  await expect(
    nmrium.page.locator('data-test-id=filters-table >> text=FFT'),
  ).toBeVisible();
}

async function phaseCorrectionFilter(nmrium: NmriumPage) {
  await nmrium.clickTool('phaseCorrection');
  await nmrium.page.fill('data-test-id=input-ph1', '-100');
  await nmrium.page.fill('data-test-id=input-ph0', '-104');

  // input debounce for 250ms
  await nmrium.page.waitForTimeout(250);

  await nmrium.page.click('button >> text=Apply');
  await expect(
    nmrium.page.locator('data-test-id=filters-table >> text=Phase correction'),
  ).toBeVisible();
}

async function baselineCorrectionFilter(nmrium: NmriumPage) {
  await nmrium.clickTool('baselineCorrection');
  await nmrium.page.click('button >> text=Apply');

  await expect(
    nmrium.page.locator(
      'data-test-id=filters-table >> text=Baseline correction',
    ),
  ).toBeVisible();
}

test('process 1d FID 13c spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await open13CFidSpectrum(nmrium);
  await nmrium.clickPanel('Filters');

  await test.step('Apply Apodization filter', async () => {
    await apodizationFilter(nmrium);
  });
  await test.step('Apply Zero filling filter', async () => {
    await zeroFillingFilter(nmrium);
  });
  await test.step('Apply fourier Transform filter', async () => {
    await fourierTransformFilter(nmrium);
  });
  await test.step('Apply phase correction filter', async () => {
    await phaseCorrectionFilter(nmrium);
  });
  await test.step('Apply baseline correction filter', async () => {
    await baselineCorrectionFilter(nmrium);
  });
});
