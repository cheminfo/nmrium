import { setTimeout as wait } from 'node:timers/promises';

import { test, expect } from '@playwright/test';

import NmriumPage from '../NmriumPage';
import { createPeakInRange } from '../utilities/selectRange';

async function addPeaks(nmrium: NmriumPage) {
  const peakAnnotationLocator = nmrium.page.locator('_react=PeakAnnotation');

  // select peak picking tool
  await nmrium.clickTool('peakPicking');

  // add peak by select range
  await createPeakInRange(nmrium, {
    axis: 'X',
    startX: 50,
    endX: 100,
  });

  await expect(peakAnnotationLocator).toHaveCount(1);

  // TODO: Get rid of this timeout.
  // Without it, the click seems to have no effect.
  await wait(500);

  await nmrium.viewerLocator.click({
    modifiers: ['Shift'],
    position: {
      x: 200,
      y: 20,
    },
  });

  await expect(peakAnnotationLocator).toHaveCount(2);
}

async function shiftX(nmrium: NmriumPage) {
  const peakInputLocator = nmrium.page.locator(
    '_react=PeakAnnotation >> nth=0 >> input',
  );

  await peakInputLocator.click();
  await peakInputLocator.selectText();
  await peakInputLocator.type('10');
  await peakInputLocator.press('Enter');

  await expect(peakInputLocator).toHaveValue('10');
}

async function shiftSpectraByDeltaColumn(nmrium: NmriumPage) {
  const ppmColumnLocator = nmrium.page.locator(
    '_react=PeaksTable >> .editable-column-input >> nth=1 ',
  );

  await ppmColumnLocator.dblclick();
  const inputLocator = ppmColumnLocator.locator('input');
  await inputLocator.selectText();
  await inputLocator.type('20');
  await inputLocator.press('Enter');

  const peakInputLocator = nmrium.page.locator(
    '_react=PeakAnnotation >> nth=0 >> input',
  );
  await expect(peakInputLocator).toHaveValue('20');
}

async function deletePeak(nmrium: NmriumPage) {
  const peakAnnotationLocator = nmrium.page.locator(
    '_react=PeakAnnotation >> nth=0',
  );
  await peakAnnotationLocator.hover();
  await nmrium.page.keyboard.press('Delete');

  // Test that the peak deleted
  await expect(nmrium.page.locator('_react=PeakAnnotation')).toHaveCount(1);
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

  await expect(nmrium.page.locator('_react=PeakAnnotation')).toHaveCount(50);
});
test('Processed spectra peaks', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await test.step('Open Processed 13C Spectrum', async () => {
    await nmrium.page.click('li >> text=General');
    await nmrium.page.click('li >> text=Processed 13C Spectrum');

    // wait specturm to load
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
      await expect(peak).toBeVisible();
      await expect(peak).toContainText(p);
      await expect(peak).toContainText(intensity);
    }
  });
});
test('Check no negative peaks in processed spectra', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await test.step('Open 13c spectrum', async () => {
    await nmrium.page.click('li >> text=General');
    await nmrium.page.click('li >> text=Processed 13C Spectrum');

    // wait specturm to load
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
      expect(await peak.locator('td >> nth=2').textContent()).not.toContain(
        '-',
      );
    }
  });
});
