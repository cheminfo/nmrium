import { expect, test } from '@playwright/test';

import NmriumPage from '../NmriumPage/index.js';

async function open13CFidSpectrum(nmrium: NmriumPage) {
  await nmrium.page.click('li >> text=Cytisine');
  await nmrium.page.click('li >> text=13C FID >> nth=0');
}

async function clickApply(nmrium: NmriumPage) {
  await nmrium
    .getToolOptions()
    .getByRole('button', { name: 'Apply', exact: true })
    .click();
}

async function apodizationFilter(
  nmrium: NmriumPage,
  { keyboard = false } = {},
) {
  if (keyboard) {
    await nmrium.viewer.moveMouse();
    await nmrium.page.keyboard.press('KeyA');
  } else {
    await nmrium.clickTool('apodization');
  }

  await expect(nmrium.page.getByTestId('apodization-line')).toBeVisible();
  const lineBroadening = nmrium
    .getFiltersList()
    .getByRole('spinbutton', { name: 'Line broadening:' });
  await lineBroadening.fill('2');
  await expect(lineBroadening).toHaveClass(/debounce-end/);

  await clickApply(nmrium);

  await expect(
    nmrium
      .getFiltersList()
      .getByText('Apodization / Window functions', { exact: true }),
  ).toBeVisible();
}

async function zeroFillingFilter(nmrium: NmriumPage) {
  await nmrium.clickTool('zeroFilling');
  await clickApply(nmrium);

  await expect(nmrium.getFiltersList().getByText('Zero Filling')).toBeVisible();
}

async function fourierTransformFilter(nmrium: NmriumPage) {
  await nmrium.clickTool('fft');

  await expect(nmrium.getFiltersList().getByText('FFT')).toBeVisible();
}

async function baselineCorrectionFilter(
  nmrium: NmriumPage,
  { keyboard = false } = {},
) {
  if (keyboard) {
    await nmrium.viewer.moveMouse();
    await nmrium.page.keyboard.press('KeyB');
  } else {
    await nmrium.clickTool('baselineCorrection');
  }
  await clickApply(nmrium);

  await expect(
    nmrium.getFiltersList().getByText('Baseline correction'),
  ).toBeVisible();
}

async function addPeaks(nmrium: NmriumPage, { keyboard = false } = {}) {
  if (keyboard) {
    await nmrium.viewer.moveMouse();
    await nmrium.page.keyboard.press('KeyP');
  } else {
    await nmrium.clickTool('peakPicking');
  }

  await nmrium
    .getToolOptions()
    .getByRole('button', { name: 'Apply to 1 spectra' })
    .click();

  await expect(
    nmrium.getFiltersList().getByText('Baseline correction'),
  ).toBeVisible();
}
async function checkPeakNumber(nmrium: NmriumPage, number: number) {
  const peaksTable = nmrium.page.locator(
    '_react=PeaksTable >> _react=TanStackTable >> .table-container',
  );
  await peaksTable.evaluate((e) => {
    e.scrollTop = e.scrollHeight;
  });

  const lastPeak = peaksTable.locator(`_react=TableRow[key="${number - 1}"]`);

  await expect(lastPeak).toBeVisible();
}

test('process 1d FID 13c spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await open13CFidSpectrum(nmrium);
  await nmrium.clickPanel('Processing');

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
    await nmrium.assertOneDimensionXScaleDomain(0, 200);
  });
  await test.step('Check filters panel', async () => {
    await expect(nmrium.getFiltersList().getByRole('listitem')).toHaveCount(6);
  });
  await test.step('Check spectrum is displayed', async () => {
    await expect(nmrium.page.getByTestId('spectrum-line')).toBeVisible();
  });
});
test('process 13c spectrum with shortcuts', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await open13CFidSpectrum(nmrium);
  await nmrium.clickPanel('Processing');

  await test.step('Apply Apodization filter', async () => {
    await apodizationFilter(nmrium, { keyboard: true });
  });
  await test.step('Apply Zero filling filter', async () => {
    await zeroFillingFilter(nmrium);
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
  await test.step('Add peaks with default min-max ratio', async () => {
    await addPeaks(nmrium, { keyboard: true });
  });
  await test.step('Check peaks table', async () => {
    await checkPeakNumber(nmrium, 16);
  });
  await test.step('Check filters panel', async () => {
    await expect(nmrium.getFiltersList().getByRole('listitem')).toHaveCount(6);
  });
});

test('Processed spectra filters', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await test.step('Open 13c spectrum', async () => {
    await nmrium.page.click('li >> text=Cytisine');
    await nmrium.page.click('li >> text=Processed 13C FID');

    // wait spectrum to load
    await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();
  });
  await test.step('Check filters panel', async () => {
    //Open peaks panel
    await nmrium.clickPanel('Processing');

    await expect(nmrium.getFiltersList().getByRole('listitem')).toHaveCount(6);
  });
});
test('Exclusion zones', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await test.step('Open Coffee example', async () => {
    await nmrium.page.click('li >> text=Multiple spectra');
    await nmrium.page.click('li >> text=Coffee');

    // wait spectrum to load
    await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();

    // select the 1H tab
    await nmrium.getSpectraTab('1H').click();
  });

  await test.step('activate exclusion zones tool', async () => {
    //open general setting
    await nmrium.clickTool('general-settings');

    //click on the display tab
    await nmrium.page
      .getByRole('dialog')
      .getByRole('tab', { name: 'Tools', exact: true })
      .click();

    //enable exclusion zone tool
    await nmrium.page
      .getByRole('dialog')
      .getByRole('tabpanel')
      .getByLabel('Exclusion zones')
      // it seems tanstack-blueprint checkboxes have issues with `actionability`
      // https://playwright.dev/docs/actionability
      .check({ force: true });

    await nmrium.saveWorkspaceModal('test');
  });

  await test.step('add exclusion zones', async () => {
    //select exclusion zones tool
    await nmrium.clickTool('exclusionZones');
    // Add exclusion zones.
    await nmrium.viewer.drawRectangle({
      axis: 'x',
      startX: 100,
      endX: 150,
    });
    // check that the filters applied to all spectra
    await expect(
      nmrium.page.locator('_react=ExclusionZoneAnnotation'),
    ).toHaveCount(13);
  });

  await test.step('Check Exclusion Zones filter for the third spectrum', async () => {
    // Select the third spectrum to be sure that the filter is not only applied to the first spectrum.
    const spectraTable = nmrium.page.locator('_react=SpectraTable');
    await spectraTable.locator(`tbody tr`).nth(2).click();

    await expect(
      nmrium.getFiltersList().getByText('Exclusion zones'),
    ).toBeVisible();
  });

  await test.step('add exclusion zones to the active spectrum', async () => {
    //select exclusion zones tool
    await nmrium.clickTool('exclusionZones');

    // Add exclusion zones to the last spectrum which is active from the previous step.
    await nmrium.viewer.drawRectangle({
      axis: 'x',
      startX: 200,
      endX: 220,
    });

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
