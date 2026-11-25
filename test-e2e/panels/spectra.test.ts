import { expect, test } from '@playwright/test';

import NmriumPage from '../NmriumPage/index.js';
import { getTableRows } from '../table.js';

/**
 * Get the button that opens the settings of a spectrum in the spectra table.
 * It shows the color of the spectrum.
 * @param nmrium - The NMRium page.
 */
function getSpectrumSettingsButton(nmrium: NmriumPage) {
  return nmrium
    .getSpectraTable()
    .getByRole('button', { name: 'Spectrum settings' });
}

function getSpectrumSettingsDialog(nmrium: NmriumPage) {
  return nmrium.page.getByRole('dialog', { name: 'Spectrum settings' });
}

async function expectColorIndicator2D(
  nmrium: NmriumPage,
  positiveColor: string,
  negativeColor: string,
) {
  const triangles = nmrium.page.getByTestId('color-indicator').locator('path');
  await expect(triangles.nth(0)).toHaveAttribute('fill', positiveColor);
  await expect(triangles.nth(1)).toHaveAttribute('fill', negativeColor);
}

function getShowSpectrumButtons(nmrium: NmriumPage) {
  return nmrium
    .getSpectraTable()
    .getByRole('button', { name: 'Show spectrum' });
}

function getSaveAsDialog(nmrium: NmriumPage) {
  return nmrium.page.getByRole('dialog', { name: /^Save as/ });
}

test('Should 1d spectrum hide/show', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open1D();

  const spectrumButtonLocator = nmrium.page.getByTestId(
    'hide-show-spectrum-button',
  );
  const spectrumLineLocator = nmrium.page.getByTestId('spectrum-line');

  // Click on hide/show spectrum button.
  await spectrumButtonLocator.click();

  await expect(spectrumLineLocator).toBeHidden();

  // Click on hide/show spectrum button.
  await spectrumButtonLocator.click();

  //check if the spectrum is visible again
  await expect(spectrumLineLocator).toBeVisible();
});

test('Check if the color picker is visible after click on the ColorIndicator', async ({
  page,
}) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open2D();
  await nmrium.getSpectraTab('1H,1H').click();
  const colorPicker = nmrium.page.getByTestId('selected-color-btn');

  await expect(colorPicker).toHaveCount(0);
  await getSpectrumSettingsButton(nmrium).first().click();
  await expect(colorPicker).toHaveCount(2);
});

test('Navigate spectra tabs with the keyboard', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open2D();

  const tab1H = nmrium.getSpectraTab('1H');
  const tab2D = nmrium.getSpectraTab('1H,1H');

  await tab1H.click();
  await expect(tab1H).toHaveAttribute('aria-selected', 'true');
  await expect(tab1H).toBeFocused();

  await page.keyboard.press('ArrowRight');
  await expect(tab2D).toHaveAttribute('aria-selected', 'true');
  await expect(tab2D).toBeFocused();
  await expect(tab1H).toHaveAttribute('aria-selected', 'false');

  // Wraps around to the first tab.
  await page.keyboard.press('ArrowRight');
  await expect(tab1H).toHaveAttribute('aria-selected', 'true');
  await expect(tab1H).toBeFocused();

  await page.keyboard.press('End');
  await expect(tab2D).toHaveAttribute('aria-selected', 'true');
  await expect(tab2D).toBeFocused();

  await page.keyboard.press('Home');
  await expect(tab1H).toHaveAttribute('aria-selected', 'true');
  await expect(tab1H).toBeFocused();

  // The panel shows the content of the selected tab.
  await expect(
    nmrium.getPanel('spectraPanel').getByRole('tabpanel'),
  ).toHaveAccessibleName('1H');
});

test('Should Zoom', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open1D();
  const pathLocator = nmrium.page.getByTestId('spectrum-line');

  const previousPath = (await pathLocator.getAttribute('d')) as string;

  await nmrium.viewer.drawRectangle({ axis: 'x', startX: 100, endX: 200 });

  // wait for path to change
  await expect(pathLocator).not.toHaveAttribute('d', previousPath);

  const path = (await pathLocator.getAttribute('d')) as string;

  expect(path.length).toBeGreaterThan(1000);
  expect(path).not.toContain('NaN');
  expect(path).not.toMatch(previousPath);
});

test('Check change spectrum color, Should be green', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open1D();

  const spectrumLine = nmrium.page.getByTestId('spectrum-line');

  // The spectrum line should not be green at the beginning.
  await expect(spectrumLine).not.toHaveAttribute('stroke', '#007d34');
  // Open Change colour modal.
  await getSpectrumSettingsButton(nmrium).click();
  // Select the green colour preset.
  await nmrium.page.getByTestId('color-hex-#007D34').click();
  // The line should now be green.
  await expect(spectrumLine).toHaveAttribute('stroke', '#007d34');
});

test('Should 2d deactivate spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open2D();
  await nmrium.getSpectraTab('1H,1H').click();
  const spectrumButtonLocator = getTableRows(nmrium.getSpectraTable()).first();

  const spectrumLineLocator = nmrium.page.getByTestId('spectrum-line').nth(0);

  // deactivate spectrum
  await spectrumButtonLocator.click();

  // should spectra still visible
  await expect(spectrumLineLocator).toBeVisible();
});

test('2d spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);

  await test.step('Open COSY ethylbenzene 2D spectrum', async () => {
    await nmrium.openDemo('Simple spectra', 'COSY ethylbenzene');
    // Wait the spectrum to load
    await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();

    await nmrium.getSpectraTab('1H').click();
  });

  await test.step('Check two spectrum tabs', async () => {
    await expect(nmrium.getSpectraTabs()).toHaveText(['1H', '1H,1H']);
  });

  await test.step('Change 1H spectrum color', async () => {
    // Check ColorIndicator initial color
    await expect(nmrium.page.getByTestId('color-indicator')).toHaveCSS(
      'background-color',
      'rgb(124, 35, 83)',
    );
    // Check spectrum initial color match with ColorIndicator
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveAttribute(
      'stroke',
      '#7c2353',
    );

    // Open Change color modal
    await getSpectrumSettingsButton(nmrium).click();
    await nmrium.page.getByTestId('select-color-btn').click();

    // change the color to #e4c0d3
    const hexInput = nmrium.page.getByLabel('hex', { exact: true });
    await hexInput.fill('e4c0d3');
    await hexInput.press('Enter');

    // Check that the selected color changed from the initial value
    await expect(nmrium.page.getByTestId('color-indicator')).not.toHaveCSS(
      'background-color',
      'rgb(124, 35, 83)',
    );
    await expect(nmrium.page.getByTestId('spectrum-line')).not.toHaveAttribute(
      'stroke',
      '#7c2353',
    );

    // Close color picker
    await nmrium.viewer.locator.click({ force: true });
    await expect(getSpectrumSettingsDialog(nmrium)).toBeHidden();
  });

  await test.step('Change H1,H1 spectrum', async () => {
    await nmrium.getSpectraTab('1H,1H').click();
    // Check top spectrum
    await expect(
      nmrium.page.getByRole('img', { name: 'Top 1D spectrum' }),
    ).toBeVisible();

    // Check left spectrum
    await expect(
      nmrium.page.getByRole('img', { name: 'Left 1D spectrum' }),
    ).toBeVisible();

    // Check two Contours
    await expect(nmrium.page.getByTestId('contours-positive')).toBeVisible();
    await expect(nmrium.page.getByTestId('contours-negative')).toBeHidden();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(2);
  });

  await test.step('Change 1H,1H spectrum color', async () => {
    // Check ColorIndicator initial color
    await expectColorIndicator2D(nmrium, 'darkblue', 'blue');
    // Check spectrum initial color match with ColorIndicator
    await expect(
      nmrium.page.getByTestId('contours-positive').locator('path'),
    ).toHaveAttribute('stroke', 'darkblue');
    await expect(nmrium.page.getByTestId('contours-negative')).toBeHidden();

    // Open Change color modal
    await getSpectrumSettingsButton(nmrium).click();

    //Change contours levels
    const negativeSettings = getSpectrumSettingsDialog(nmrium).getByRole(
      'group',
      { name: 'Negative', exact: true },
    );
    await negativeSettings
      .getByRole('slider', { name: 'Minimum level' })
      .hover();
    await negativeSettings.getByText('0', { exact: true }).click();

    await nmrium.page.getByTestId('color-hex-#C10020').first().click();

    // Change colors
    await nmrium.page.getByTestId('color-hex-#C10020').first().click();
    await nmrium.page.getByTestId('color-hex-#803E75').nth(1).click();

    // Check that ColorIndicator color changed
    await expectColorIndicator2D(nmrium, '#c10020', '#803e75');
    // Check that spectra color changed
    await expect(
      nmrium.page.getByTestId('contours-positive').locator('path'),
    ).toHaveAttribute('stroke', '#c10020');
    await expect(
      nmrium.page.getByTestId('contours-negative').locator('path'),
    ).toHaveAttribute('stroke', '#803e75');
    // Close color picker
    await nmrium.viewer.locator.click({ force: true });
    await expect(getSpectrumSettingsDialog(nmrium)).toBeHidden();
  });

  await test.step('Check hide spectra', async () => {
    // Hide positive spectrum
    await nmrium.page
      .getByRole('button', { name: 'Show positive contours' })
      .click();
    await expect(nmrium.page.getByTestId('contours-positive')).toBeHidden();
    await expect(nmrium.page.getByTestId('contours-negative')).toBeVisible();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(1);

    // Hide negative spectrum
    await nmrium.page
      .getByRole('button', { name: 'Show negative contours' })
      .click();
    await expect(nmrium.page.getByTestId('contours-positive')).toBeHidden();
    await expect(nmrium.page.getByTestId('contours-negative')).toBeHidden();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(0);
    // Show positive spectrum
    await nmrium.page
      .getByRole('button', { name: 'Show positive contours' })
      .click();
    await expect(nmrium.page.getByTestId('contours-positive')).toBeVisible();
    await expect(nmrium.page.getByTestId('contours-negative')).toBeHidden();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(1);

    // Show negative spectrum
    await nmrium.page
      .getByRole('button', { name: 'Show negative contours' })
      .click();
    await expect(nmrium.page.getByTestId('contours-positive')).toBeVisible();
    await expect(nmrium.page.getByTestId('contours-negative')).toBeVisible();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(2);
  });

  await test.step('Delete 1H tab', async () => {
    // Go to 1H tab
    await nmrium.getSpectraTab('1H').click();

    await nmrium
      .getPanelToolbarButton('spectraPanel', 'Delete selected spectra')
      .click();
    // Confirm delete the selected spectra.
    await nmrium.page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Yes', exact: true })
      .click();

    // Check tabs
    await expect(nmrium.getSpectraTabs()).toHaveText(['1H,1H']);
    // Check top spectrum
    await expect(
      nmrium.page.getByRole('img', { name: 'Top 1D spectrum' }),
    ).toBeHidden();
    // Check left spectrum
    await expect(
      nmrium.page.getByRole('img', { name: 'Left 1D spectrum' }),
    ).toBeHidden();
    // Check two Contours
    await expect(nmrium.page.getByTestId('contours-positive')).toBeVisible();
    await expect(nmrium.page.getByTestId('contours-negative')).toBeVisible();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(2);
  });

  await test.step('Add projection', async () => {
    // Click add missing projection btn
    await nmrium.clickToolByTitle('Add missing projection');

    // Check tabs
    await expect(nmrium.getSpectraTabs()).toHaveText(['1H', '1H,1H']);
    // Check top spectrum
    await expect(
      nmrium.page.getByRole('img', { name: 'Top 1D spectrum' }),
    ).toBeVisible();
    // Check left spectrum
    await expect(
      nmrium.page.getByRole('img', { name: 'Left 1D spectrum' }),
    ).toBeVisible();
    // Check two Contours
    await expect(nmrium.page.getByTestId('contours-positive')).toBeVisible();
    await expect(nmrium.page.getByTestId('contours-negative')).toBeVisible();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(2);
  });
});

test('show/hide spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);

  await test.step('Open Coffee spectrum', async () => {
    await nmrium.openDemo('Multiple spectra', 'Coffee');
    // Wait the spectrum to load
    await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(13);
  });
  await test.step('Check hide spectra', async () => {
    // Hide the first spectrum
    await getShowSpectrumButtons(nmrium).nth(0).click();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(12);

    // Hide the second spectrum
    await getShowSpectrumButtons(nmrium).nth(1).click();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(11);
    // Show the first spectrum
    await getShowSpectrumButtons(nmrium).nth(0).click();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(12);

    // Show the second spectrum
    await getShowSpectrumButtons(nmrium).nth(1).click();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(13);
  });
});

test('Export sources from 1H spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await test.step('Load 1H spectrum', async () => {
    await nmrium.open1D();
  });
  await test.step('Open Save as window ', async () => {
    await nmrium.clickNMRViewerTool('exportAs');
    await nmrium.page
      .getByRole('menuitem', { name: 'Save as', exact: true })
      .click();
  });
  await test.step('Check include data options', async () => {
    const fields = getSaveAsDialog(nmrium).getByRole('radio');
    await expect(fields).toHaveCount(3);

    const disabledFields = getSaveAsDialog(nmrium).getByRole('radio', {
      disabled: true,
    });
    await expect(disabledFields).toHaveCount(0);
  });
});

test('Export sources from imported spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await test.step('Drag and drop spectrum', async () => {
    await nmrium.dropFile('ethylbenzene-1h.jdx');
  });
  await test.step('Open Save as window ', async () => {
    await nmrium.clickNMRViewerTool('exportAs');
    await nmrium.page
      .getByRole('menuitem', { name: 'Save as', exact: true })
      .click();
  });
  await test.step('Check include data options', async () => {
    const fields = getSaveAsDialog(nmrium).getByRole('radio');
    await expect(fields).toHaveCount(3);
    const disabledFields = getSaveAsDialog(nmrium).getByRole('radio', {
      disabled: true,
    });
    await expect(disabledFields).toHaveCount(1);
    await expect(disabledFields).toHaveAttribute(
      'value',
      'SELF_CONTAINED_EXTERNAL_DATASOURCE',
    );
  });
});

test('Multiple spectra analysis', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);

  await test.step('Open Coffee spectrum and check 13 spectra', async () => {
    await nmrium.openDemo('Multiple spectra', 'Coffee');
    // Wait the spectrum to load
    await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(13);
  });
  await test.step('Check spectra colors', async () => {
    expect(await nmrium.getNumberOfDistinctColors()).toBe(13);
  });
  await test.step('Check Recolour based on spectrum name', async () => {
    await nmrium
      .getSpectraTable()
      .getByRole('columnheader', { name: 'Spectrum Name', exact: true })
      .click({ button: 'right' });
    await nmrium.page.click('text="Recolor based on distinct value"');
    expect(await nmrium.getNumberOfDistinctColors()).toBe(13);
  });
  await test.step('Check recolour based on pulse', async () => {
    await nmrium
      .getSpectraTable()
      .getByRole('columnheader', { name: 'Pulse', exact: true })
      .click({ button: 'right' });
    await nmrium.page.click('text="Recolor based on distinct value"');
    expect(await nmrium.getNumberOfDistinctColors()).toBe(1);
  });
  await test.step('Check again recolour based on spectrum name', async () => {
    await nmrium
      .getSpectraTable()
      .getByRole('columnheader', { name: 'Spectrum Name', exact: true })
      .click({ button: 'right' });
    await nmrium.page.click('text="Recolor based on distinct value"');
    expect(await nmrium.getNumberOfDistinctColors()).toBe(13);
  });
  await test.step('Check recolour based on solvent', async () => {
    await nmrium
      .getSpectraTable()
      .getByRole('columnheader', { name: 'Solvent', exact: true })
      .click({ button: 'right' });
    await nmrium.page.click('text="Recolor based on distinct value"');
    expect(await nmrium.getNumberOfDistinctColors()).toBe(1);
  });
  await test.step('Check Recolour BarButton', async () => {
    await nmrium.clickToolByTitle('Default spectra recoloring');
    expect(await nmrium.getNumberOfDistinctColors()).toBe(13);
  });
});
test('Load JResolv', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.openDemo('Cytisine', 'jResolv cytisine');

  await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();
  await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(2);
});
