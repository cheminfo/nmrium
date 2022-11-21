import { test, expect } from '@playwright/test';

import NmriumPage from '../NmriumPage';
import { selectRange } from '../utilities/selectRange';

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

test('Processed spectra filters', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await test.step('Open 13c spectrum', async () => {
    await nmrium.page.click('li >> text=General');
    await nmrium.page.click('li >> text=Processed 13C Spectrum');

    // wait specturm to load
    await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();
  });
  await test.step('Check filters panel', async () => {
    //Open peaks panel
    await nmrium.clickPanel('Filters');

    const filters = nmrium.page.locator('_react=FilterTable');
    await expect(filters).toHaveCount(6);
  });
});
test('Exclusion zones', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await test.step('Open Coffee example', async () => {
    await nmrium.page.click('li >> text=General');
    await nmrium.page.click('li >> text=Coffee');

    // wait spectrum to load
    await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();

    // select the 1H tab
    await nmrium.page.click(
      '_react=SpectrumsTabs >> _react=InternalTab[tablabel="1H"]',
    );
  });

  await test.step('activate exclusision zones tool', async () => {
    //open general setting
    await nmrium.clickTool('general-settings');

    //click on the display tab
    await nmrium.page.click('_react=InternalTab[tabid="tools"]');

    //enable exclusion zone tool
    await nmrium.page
      .locator(':text("Exclusion zones")  + td > div > input')
      .click();

    // save setting changes
    await nmrium.page.click('text=Save');

    //check if the exclusion zones tool exists in the main toolbar
    await expect(
      nmrium.page.locator(`_react=ToolbarItem[id="exclusionZones"]`),
    ).toBeVisible();
  });

  // open filters panel
  await nmrium.clickPanel('Filters');
  const filters = nmrium.page.locator('_react=FilterTable');

  await test.step('add exclusision zones', async () => {
    //select exclusion zones tool
    await nmrium.clickTool('exclusionZones');
    //add exclusion zones
    await selectRange(nmrium, { axis: 'X', startX: 100, endX: 150 });
    // check that the filters applied to all spectra
    await expect(
      nmrium.page.locator('_react=ExclusionZoneAnnotation'),
    ).toHaveCount(13);
  });

  await test.step('Check Exclusion Zones filter for the last spectrum', async () => {
    //select spectrum the last spectrum to be sure that the filter applied to all spectra
    await nmrium.page
      .locator('_react=SpectraTable >> _react=ReactTableRow >> nth=11')
      .click();
    //Open filters panel
    await expect(filters.locator('text=Exclusion Zones')).toBeVisible();
  });

  await test.step('add exclusion zones to the active spectrum', async () => {
    //add exclusion zones to the last spectrum which is active from the previous step
    await selectRange(nmrium, { axis: 'X', startX: 200, endX: 220 });

    // the number of exclusion zones  should become 14 since the previous count for all spectra is 13
    await expect(
      nmrium.page.locator('_react=ExclusionZoneAnnotation'),
    ).toHaveCount(14);
  });

  // the number of exclusion zones should become 2 since we have one from the previous step
  await expect(
    nmrium.page.locator(
      '_react=ExclusionZoneAnnotation >> _react=rect[style.opacity = 1]',
    ),
  ).toHaveCount(2);
});
