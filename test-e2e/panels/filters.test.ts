import { test, expect } from '@playwright/test';

import NmriumPage from '../NmriumPage';

async function open13CFidSpectrum(nmrium: NmriumPage) {
  await nmrium.page.click('li >> text=General');
  await nmrium.page.click('li >> text=13C Spectrum >> nth=0');
}

async function zeroFillingFilter(nmrium: NmriumPage) {
  await nmrium.clickTool('zeroFilling');
  await nmrium.page.click('button >> text=Apply');

  await expect(
    nmrium.page.locator('data-test-id=filters-table >> text=Zero Filling'),
  ).toBeVisible();
  await expect(
    nmrium.page.locator('data-test-id=filters-table >> text=Line broadening'),
  ).toBeVisible();
}

async function fourierTransformFilter(nmrium: NmriumPage) {
  await nmrium.clickTool('fft-filter');

  await expect(
    nmrium.page.locator('data-test-id=filters-table >> text=FFT'),
  ).toBeVisible();
}

async function phaseCorrectionFilter(nmrium: NmriumPage) {
  await nmrium.clickTool('phaseCorrection');
  await nmrium.page.fill('data-test-id=input-ph1', '-100');
  await nmrium.page.fill('data-test-id=input-ph0', '-104');
  await nmrium.page.click('button >> text=Apply');
  /* TODO: Find out why this is flaky.
  await expect(
    nmrium.page.locator('data-test-id=filters-table >> text=Phase correction'),
  ).toBeVisible();
  */
}

async function baselineCorrectionFilter(nmrium: NmriumPage) {
  await nmrium.clickTool('baseLineCorrection');
  await nmrium.page.click('button >> text=Apply');
  /* TODO: Find out why this is flaky.
  await expect(
    nmrium.page.locator(
      'data-test-id=filters-table >> text=Baseline correction',
    ),
  ).toBeVisible();
  */
}

test('process 1d FID 13c spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);

  await open13CFidSpectrum(nmrium);

  await nmrium.clickPanel('Filters');

  await zeroFillingFilter(nmrium);
  await fourierTransformFilter(nmrium);
  await phaseCorrectionFilter(nmrium);
  await baselineCorrectionFilter(nmrium);
});
