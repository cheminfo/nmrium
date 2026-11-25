import { expect, test } from '@playwright/test';

import NmriumPage from '../NmriumPage/index.js';
import { getTableCell, getTableRows } from '../table.js';

function getPeakAnnotations(nmrium: NmriumPage) {
  return nmrium.page.getByTestId('peak-annotation');
}

/**
 * Get the label of the first peak annotation, which shows its position.
 * @param nmrium - The NMRium page.
 */
function getFirstPeakLabel(nmrium: NmriumPage) {
  return getPeakAnnotations(nmrium).first().locator('text');
}

async function addPeaks(nmrium: NmriumPage) {
  const peaksAnnotationLocator = getPeakAnnotations(nmrium);

  // Select peak picking tool.
  await nmrium.clickNMRViewerTool('peakPicking');

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
  const peakLocator = getFirstPeakLabel(nmrium);

  await peakLocator.click();
  const peakInputLocator = nmrium.page.getByRole('spinbutton', {
    name: 'Peak position',
  });
  await peakInputLocator.pressSequentially('10');
  await peakInputLocator.press('Enter');

  await expect(peakLocator).toHaveText('10.00');
}

async function shiftSpectraByDeltaColumn(nmrium: NmriumPage) {
  const ppmColumnLocator = await getTableCell(
    nmrium.getPanel('peaksPanel').getByRole('table'),
    1,
    'δ (ppm)',
  );

  await ppmColumnLocator.dblclick();
  const inputLocator = ppmColumnLocator.getByRole('spinbutton');
  await inputLocator.selectText();
  await inputLocator.fill('20');
  await inputLocator.press('Enter');

  const peakInputLocator = getFirstPeakLabel(nmrium);
  await expect(peakInputLocator).toHaveText('20.00');
}

async function deletePeak(nmrium: NmriumPage) {
  const peakAnnotationLocator = getFirstPeakLabel(nmrium);
  await peakAnnotationLocator.hover();
  await nmrium.page.keyboard.press('Delete');

  // Test that the peak deleted
  await expect(getPeakAnnotations(nmrium)).toHaveCount(1);
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

  // Select peak picking tool.
  await nmrium.clickNMRViewerTool('peakPicking');

  // Apply auto peak detection.
  await nmrium
    .getToolOptions()
    .getByRole('button', { name: 'Apply to 1 spectra', exact: true })
    .click();

  await expect(getPeakAnnotations(nmrium)).toHaveCount(154);
});

test('Processed spectra peaks', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await test.step('Open Processed 13C FID', async () => {
    await nmrium.openDemo('Cytisine', 'Processed 13C FID');

    // Wait for the spectrum to load
    await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();
  });
  await test.step('Check peaks', async () => {
    //Close spectra panel
    await nmrium.clickPanel('spectraPanel');
    //Close ranges panel
    await nmrium.clickPanel('rangesPanel');
    //Open peaks panel
    await nmrium.showPanel('peaksPanel');

    const peaks = getTableRows(
      nmrium.getPanel('peaksPanel').getByRole('table'),
    );
    await expect(peaks).toHaveCount(16);

    const peaksData = [
      { p: '26.93', intensity: '2.30e+9' },
      { p: '28.58', intensity: '2.22e+9' },
      { p: '36.3', intensity: '2.17e+9' },
      { p: '50.39', intensity: '2.03e+9' },
      { p: '53.66', intensity: '2.05e+9' },
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
    await nmrium.openDemo('Cytisine', 'Processed 13C FID');

    // Wait for the spectrum to load.
    await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();
  });
  await test.step('Check negative peaks', async () => {
    // Close spectra panel.
    await nmrium.clickPanel('spectraPanel');
    // Close ranges panel.
    await nmrium.clickPanel('rangesPanel');
    // Open peaks panel.
    await nmrium.showPanel('peaksPanel');
    const peaksTable = nmrium.getPanel('peaksPanel').getByRole('table');

    for (let i = 0; i < 16; i++) {
      // eslint-disable-next-line no-await-in-loop
      const intensity = await getTableCell(peaksTable, i, 'Intensity');
      // eslint-disable-next-line no-await-in-loop
      await expect(intensity).not.toContainText('-');
    }
  });
});
