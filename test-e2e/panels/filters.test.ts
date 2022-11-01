import { test, expect } from '@playwright/test';

import NmriumPage from '../NmriumPage';

async function open13CFidSpectrum(nmrium: NmriumPage) {
  await nmrium.page.click('li >> text=General');
  await nmrium.page.click('li >> text=13C Spectrum >> nth=0');
}

async function apodizationFilter(nmrium: NmriumPage) {
  await nmrium.clickTool('apodization');
  await expect(
    nmrium.page.locator('data-test-id=apodization-line'),
  ).toBeVisible();
  await nmrium.page.click('button >> text=Apply');

  await expect(
    nmrium.page.locator('_react=FilterPanel >> text=Apodization'),
  ).toBeVisible();
}

async function zeroFillingFilter(nmrium: NmriumPage) {
  await nmrium.clickTool('zeroFilling');
  await nmrium.page.click('button >> text=Apply');

  await expect(
    nmrium.page.locator('_react=FilterPanel >> text=Zero Filling'),
  ).toBeVisible();
}

async function fourierTransformFilter(nmrium: NmriumPage) {
  await nmrium.clickTool('fft');

  await expect(
    nmrium.page.locator('_react=FilterPanel >> text=FFT'),
  ).toBeVisible();
}

async function baselineCorrectionFilter(
  nmrium: NmriumPage,
  { keyboard = false } = {},
) {
  if (keyboard) {
    await nmrium.moveMouseToViewer();
    await nmrium.page.keyboard.press('KeyB');
  } else {
    await nmrium.clickTool('baselineCorrection');
  }
  await nmrium.page.click('button >> text=Apply');

  await expect(
    nmrium.page.locator('_react=FilterPanel >> text=Baseline correction'),
  ).toBeVisible();
}

async function addPeaks(
  nmrium: NmriumPage,
  { keyboard = false, ratio = 0.1 } = {},
) {
  if (keyboard) {
    await nmrium.moveMouseToViewer();
    await nmrium.page.keyboard.press('KeyP');
  } else {
    await nmrium.clickTool('peakPicking');
  }

  if (ratio !== 0.1) {
    await nmrium.page.fill(
      '.toolOptionsPanel >> [name="minMaxRatio"]',
      ratio.toString(),
    );
  }
  await nmrium.page.click('button >> text=Apply');

  await expect(
    nmrium.page.locator('_react=FilterPanel >> text=Baseline correction'),
  ).toBeVisible();
}
async function checkPeakNumber(nmrium: NmriumPage, number: number) {
  const peaksTable = nmrium.page.locator(
    '_react=PeaksTable >> _react=ReactTable >> .table-container',
  );
  await peaksTable.evaluate((e) => {
    e.scrollTop = e.scrollHeight;
  });

  const lastPeak = peaksTable.locator(
    `_react=[role="row"][key="row_${number - 1}"]`,
  );
  const inexistentPeak = peaksTable.locator(
    `_react=[role="row"][key="row_${number}"]`,
  );
  await expect(lastPeak).toBeVisible();
  await expect(inexistentPeak).toBeHidden();
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
    await nmrium.applyPhaseCorrection();
  });
  await test.step('Apply baseline correction filter', async () => {
    await baselineCorrectionFilter(nmrium);
  });
  await test.step('Check horizontal scale domain', async () => {
    await nmrium.assertXScaleDomain(0, 200);
  });
  await test.step('Check filters panel', async () => {
    await expect(
      nmrium.page.locator('_react=FilterPanel >> .filter-row'),
    ).toHaveCount(6);
  });
  await test.step('Check spectrum is displayed', async () => {
    await expect(
      nmrium.page.locator('data-test-id=spectrum-line'),
    ).toBeVisible();
  });
});
test('process 13c spectrum with shortcuts', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await open13CFidSpectrum(nmrium);
  await nmrium.clickPanel('Filters');

  await test.step('Apply Apodization filter', async () => {
    await apodizationFilter(nmrium);
  });
  await test.step('Apply fourier Transform filter', async () => {
    await fourierTransformFilter(nmrium);
  });
  await test.step('Apply phase correction filter', async () => {
    await nmrium.applyPhaseCorrection({ keyboard: true, mode: 'automatic' });
  });
  await test.step('Apply baseline correction filter', async () => {
    await baselineCorrectionFilter(nmrium, { keyboard: true });
  });
  await test.step('Add default peaks', async () => {
    await addPeaks(nmrium, { keyboard: true });
  });
  await test.step('Check peaks table', async () => {
    await checkPeakNumber(nmrium, 15);
  });
  await test.step('Add peaks with 0.05 ratio', async () => {
    await addPeaks(nmrium, { keyboard: true, ratio: 0.05 });
  });
  await test.step('Check peaks table', async () => {
    await checkPeakNumber(nmrium, 16);
  });
  await test.step('Check filters panel', async () => {
    await expect(
      nmrium.page.locator('_react=FilterPanel >> .filter-row'),
    ).toHaveCount(5);
  });
});
