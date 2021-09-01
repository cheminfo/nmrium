import { setTimeout } from 'timers/promises';

import { test, expect } from '@playwright/test';

import NmriumPage from '../NmriumPage';
import { createPeakInRange } from '../utilities/selectRange';

async function addPeaks(nmrium: NmriumPage) {
  const peakAnnotationLocator = nmrium.page.locator('_react=PeakAnnotation');

  // select peak picking tool
  await nmrium.page.click('data-test-id=tool-peakPicking');

  // add peak by select range
  await createPeakInRange(nmrium, {
    axis: 'X',
    startX: 50,
    endX: 100,
  });

  await expect(peakAnnotationLocator).toHaveCount(1);

  // TODO: Get rid of this timeout.
  // Without it, the click seems to have no effect.
  await setTimeout(500);

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

async function deletePeak(nmrium: NmriumPage) {
  const peakAnnotationLocator = nmrium.page.locator(
    '_react=PeakAnnotation >> nth=1',
  );

  const { x, width, y, height } =
    (await peakAnnotationLocator.boundingBox()) as BoundingBox;

  await nmrium.page.mouse.move(x + width / 2, y + height / 2);
  await nmrium.page.keyboard.press('Delete');

  // Test that the peak deleted
  await expect(nmrium.page.locator('_react=PeakAnnotation')).toHaveCount(1);
}

test('add/shift/delete peaks', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open1D();

  await addPeaks(nmrium);
  await shiftX(nmrium);
  await deletePeak(nmrium);
});

test('Automatic peak picking should work', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open1D();

  //select range tool
  await nmrium.page.click('data-test-id=tool-peakPicking');

  //apply auto ranges detection
  await nmrium.page.click('button >> text=Apply');

  await expect(nmrium.page.locator('_react=PeakAnnotation')).toHaveCount(50);
});
