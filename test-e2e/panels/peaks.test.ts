import { expect, test } from '@playwright/test';

import NmriumPage from '../NmriumPage/index.js';

const PEAK_ANNOTATIONS_SELECTOR =
  '_react=Peaks[peaksSource="peaks"] >> _react=PeakAnnotation';
const FIRST_PEAK_ANNOTATION_SELECTOR = `${PEAK_ANNOTATIONS_SELECTOR} >> nth=0 >> text`;

async function addPeaks(nmrium: NmriumPage) {
  const peaksAnnotationLocator = nmrium.page.locator(PEAK_ANNOTATIONS_SELECTOR);

  // Select peak picking tool.
  await nmrium.clickTool('peakPicking');

  // Add peak by selecting range.
  await nmrium.viewer.drawRectangle({
    axis: 'x',
    startX: 75,
    endX: 115,
  });

  await expect(peaksAnnotationLocator).toHaveCount(1);

  // Add peak by clicking above it.
  await nmrium.viewer.moveMouse({ x: 210, y: 200 });
  await nmrium.viewer.locator.click({
    position: { x: 210, y: 200 },
  });

  await expect(peaksAnnotationLocator).toHaveCount(2);
}

async function shiftX(nmrium: NmriumPage) {
  const peakLocator = nmrium.page.locator(FIRST_PEAK_ANNOTATION_SELECTOR);

  await peakLocator.click();
  const peakInputLocator = nmrium.page.locator(
    '_react=PeakEditionField >> input',
  );
  await peakInputLocator.pressSequentially('10');
  await peakInputLocator.press('Enter');

  await expect(peakLocator).toHaveText('10.00');
}

async function shiftSpectraByDeltaColumn(nmrium: NmriumPage) {
  const ppmColumnLocator = nmrium.page.locator(
    '_react=PeaksTable >> .editable-column-input >> nth=1 ',
  );

  await ppmColumnLocator.dblclick();
  const inputLocator = ppmColumnLocator.locator('input');
  await inputLocator.selectText();
  await inputLocator.fill('20');
  await inputLocator.press('Enter');

  const peakInputLocator = nmrium.page.locator(FIRST_PEAK_ANNOTATION_SELECTOR);
  await expect(peakInputLocator).toHaveText('20.00');
}

async function deletePeak(nmrium: NmriumPage) {
  const peakAnnotationLocator = nmrium.page.locator(
    FIRST_PEAK_ANNOTATION_SELECTOR,
  );
  await peakAnnotationLocator.hover();
  await nmrium.page.keyboard.press('Delete');

  // Test that the peak deleted
  await expect(nmrium.page.locator(PEAK_ANNOTATIONS_SELECTOR)).toHaveCount(1);
}

test('add/shift/delete peaks', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open1D();

  await test.step('Add Peaks', async () => {
    await addPeaks(nmrium);
  });

  await test.step('Shift spectrum over X axis', async () => {
    await shiftX(nmrium);
    // shift the spectra by change delta from peaks table
    await shiftSpectraByDeltaColumn(nmrium);
  });

  await test.step('Delete peak', async () => {
    await deletePeak(nmrium);
  });
});

test('Automatic peak picking should work', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open1D();

  //select range tool
  await nmrium.clickTool('peakPicking');

  //apply auto ranges detection
  await nmrium.page.click('button >> text=Apply');

  await expect(nmrium.page.locator(PEAK_ANNOTATIONS_SELECTOR)).toHaveCount(50);
});
test('Processed spectra peaks', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await test.step('Open Processed 13C FID', async () => {
    await nmrium.page.click('li >> text=Cytisine');
    await nmrium.page.click('li >> text=Processed 13C FID');

    // wait spectrum to load
    await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();
  });
  await test.step('Check peaks', async () => {
    //Close spectra panel
    await nmrium.clickPanel('Spectra');
    //Open peaks panel
    await nmrium.clickPanel('Peaks');

    const peaks = nmrium.page.locator('_react=PeaksTable >> tbody >> tr');
    await expect(peaks).toHaveCount(16);

    const peaksData = [
      { p: '26.93', intensity: '2304124678.9' },
      { p: '28.58', intensity: '2220075572.1' },
      { p: '36.3', intensity: '2169790333.08' },
      { p: '50.39', intensity: '2029514468.85' },
      { p: '53.66', intensity: '2053846103.58' },
    ];
    for (const [i, { p, intensity }] of peaksData.entries()) {
      const peak = peaks.nth(i);
      // eslint-disable-next-line no-await-in-loop
      await expect(peak).toBeVisible();
      // eslint-disable-next-line no-await-in-loop
      await expect(peak).toContainText(p);
      // eslint-disable-next-line no-await-in-loop
      await expect(peak).toContainText(intensity);
    }
  });
});
test('Check no negative peaks in processed spectra', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await test.step('Open 13c spectrum', async () => {
    await nmrium.page.click('li >> text=Cytisine');
    await nmrium.page.click('li >> text=Processed 13C FID');

    // wait spectrum to load
    await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();
  });
  await test.step('Check negative peaks', async () => {
    //Close spectra panel
    await nmrium.clickPanel('Spectra');
    //Open peaks panel
    await nmrium.clickPanel('Peaks');
    const peaks = nmrium.page.locator('_react=PeaksTable >> tbody >> tr');

    for (let i = 0; i < 16; i++) {
      const peak = peaks.nth(i);
      // eslint-disable-next-line no-await-in-loop
      expect(await peak.locator('td >> nth=2').textContent()).not.toContain(
        '-',
      );
    }
  });
});
