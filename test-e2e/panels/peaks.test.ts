import { setTimeout as wait } from 'timers/promises';

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

  await expect(peakInputLocator).toHaveValue(/10\.00?/);
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
  await expect(peakInputLocator).toHaveValue(/20\.00?/);
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
