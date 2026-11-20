import { expect, test } from '@playwright/test';

import NmriumPage from '../NmriumPage/index.js';

test('exportSpectraViewerAsBlob draws the floating molecule into the SVG', async ({
  page,
}) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.page.click('li >> text=Props debug');
  await nmrium.page.click('li >> text=Ref API');
  await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();

  await nmrium.page.click('button >> text=Export viewer as SVG');

  const exported = nmrium.page.getByTestId('exported-svg');
  await expect(exported).not.toHaveValue('');
  const svg = await exported.inputValue();
  const counts = await nmrium.page.evaluate((markup) => {
    const document = new DOMParser().parseFromString(markup, 'image/svg+xml');
    return {
      spectra: document.querySelectorAll('.spectra path').length,
      moleculeGroups: document.querySelectorAll('.floating-molecules > g')
        .length,
    };
  }, svg);

  expect(counts).toStrictEqual({ spectra: 1, moleculeGroups: 1 });
  // The export dialog never opens, and nothing is left on screen.
  await expect(nmrium.page.locator('.bp6-dialog')).toBeHidden();
});
