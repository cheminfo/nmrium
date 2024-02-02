import { test, expect } from '@playwright/test';

import NmriumPage from '../NmriumPage';

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
  await nmrium.page.click('_react=SpectrumsTabs >> _react=Tab[tabid="1H,1H"]');
  const sketchPicker = nmrium.page.locator('_react=ColorPicker');

  await expect(sketchPicker).toHaveCount(0);
  await nmrium.page.click('_react=ColorIndicator >> nth=0');
  await expect(sketchPicker).toHaveCount(2);
});

test('Should Zoom', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open1D();

  const previousPath = (await nmrium.page
    .getByTestId('spectrum-line')
    .getAttribute('d')) as string;

  await nmrium.viewer.drawRectangle({ axis: 'x', startX: 100, endX: 200 });

  const path = (await nmrium.page
    .getByTestId('spectrum-line')
    .getAttribute('d')) as string;

  expect(path.length).toBeGreaterThan(1000);
  expect(path).not.toContain('NaN');
  expect(path).not.toMatch(previousPath);
});

test('Check change spectrum color, Should be white', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open1D();

  const whiteSpectrumLine = nmrium.page.locator(
    '_react=Line[display.color = "#ffffffff"]',
  );

  // There should be no white spectrum line at the beginning.
  await expect(whiteSpectrumLine).toBeHidden();

  // Open Change color modal
  await nmrium.page.click('_react=ColorIndicator');

  // Click on the top-left of the color picker (white)
  await nmrium.page.click('_react=ColorPicker >> div >> nth=0', {
    position: { x: 0, y: 0 },
  });

  // The line should now be white.
  await expect(whiteSpectrumLine).toBeVisible();
});

test('Should 2d deactivate spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open2D();
  await nmrium.page.click('_react=SpectrumsTabs >> _react=Tab[tabid="1H,1H"]');
  const spectrumButtonLocator = nmrium.page.locator(
    '_react=SpectraTable >> _react=ReactTableRow >> nth=0',
  );

  const spectrumLineLocator = nmrium.page.getByTestId('spectrum-line').nth(0);

  // deactivate spectrum
  await spectrumButtonLocator.click();

  // should spectra still visible
  await expect(spectrumLineLocator).toBeVisible();
});

test('2d spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);

  await test.step('Open COSY ethylbenzene 2D spectrum', async () => {
    await nmrium.page.click('li >> text=Simple spectra');
    await nmrium.page.click('li >> text=COSY ethylbenzene');
    // Wait the spectrum to load
    await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();

    await nmrium.page.click('_react=SpectrumsTabs >> _react=Tab[tabid="1H"]');
  });
  await test.step('Check two spectrum tabs', async () => {
    const Tabs = nmrium.page.locator('_react=SpectrumListPanel >> _react=Tab');
    await expect(Tabs).toHaveCount(2);
    await expect(Tabs.first()).toHaveText('1H');
    await expect(Tabs.last()).toHaveText('1H,1H');
  });
  await test.step('Change 1H spectrum color', async () => {
    // Check ColorIndicator initial color
    await expect(
      nmrium.page.locator('_react=ColorIndicator[display.color="#7c2353"]'),
    ).toBeVisible();
    // Check spectrum initial color match with ColorIndicator
    await expect(
      nmrium.page
        .getByTestId('spectrum-line')
        .locator('_react=Line[display.color="#7c2353"]'),
    ).toBeVisible();

    // Open Change color modal
    await nmrium.page.click('_react=ColorIndicator');

    // change the color to #ddb1c9ff
    await nmrium.page.click('_react=ColorPicker >> div >> nth=0', {
      position: { x: 40, y: 20 },
    });

    // Check that ColorIndicator color changed
    await expect(
      nmrium.page.locator('_react=ColorIndicator[display.color="#ddb1c9ff"]'),
    ).toBeVisible();
    // Check that spectrum color changed
    await expect(
      nmrium.page
        .getByTestId('spectrum-line')
        .locator('_react=Line[display.color="#ddb1c9ff"]'),
    ).toBeVisible();

    // Close color picker
    await nmrium.viewer.locator.click({ force: true });
    await expect(nmrium.page.locator('_react=ColorPicker')).toBeHidden();
  });
  await test.step('Change H1,H1 spectrum', async () => {
    await nmrium.page.click(
      '_react=SpectrumsTabs >> _react=Tab[tabid="1H,1H"]',
    );
    // Check top spectrum
    await expect(nmrium.page.locator('_react=Top1DChart')).toBeVisible();

    // Check left spectrum
    await expect(nmrium.page.locator('_react=Left1DChart')).toBeVisible();

    // Check two Contours
    await expect(
      nmrium.page.locator('_react=ContoursPaths[sign="positive"]'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('_react=ContoursPaths[sign="negative"]'),
    ).toBeVisible();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(2);
  });
  await test.step('Change 1H,1H spectrum color', async () => {
    // Check ColorIndicator initial color
    await expect(
      nmrium.page.locator(
        '_react=ColorIndicator[display.negativeColor="blue"][display.positiveColor="darkblue"]',
      ),
    ).toBeVisible();
    // Check spectrum initial color match with ColorIndicator
    await expect(
      nmrium.page.locator(
        '_react=ContoursPaths[sign="positive"][color="darkblue"]',
      ),
    ).toBeVisible();
    await expect(
      nmrium.page.locator(
        '_react=ContoursPaths[sign="negative"][color="blue"]',
      ),
    ).toBeVisible();

    // Open Change color modal
    await nmrium.page.click('_react=ColorIndicator');

    // Change colors
    await nmrium.page.click(
      '_react=ColorPicker >> _react=SketchPresetColors >> nth=0 >> div >> nth=0',
    );
    await nmrium.page.click(
      '_react=ColorPicker >> _react=SketchPresetColors >> nth=1 >> div >> nth=5',
    );

    // Check that ColorIndicator color changed
    await expect(
      nmrium.page.locator(
        '_react=ColorIndicator[display.negativeColor="#803e75ff"][display.positiveColor="#c10020ff"]',
      ),
    ).toBeVisible();
    // Check that spectrums color changed
    await expect(
      nmrium.page.locator(
        '_react=ContoursPaths[sign="positive"][color="#c10020ff"]',
      ),
    ).toBeVisible();
    await expect(
      nmrium.page.locator(
        '_react=ContoursPaths[sign="negative"][color="#803e75ff"]',
      ),
    ).toBeVisible();
    // Close color picker
    await nmrium.viewer.locator.click({ force: true });
    await expect(nmrium.page.locator('_react=ColorPicker')).toBeHidden();
  });
  await test.step('Check hide spectrums', async () => {
    // Hide positive spectrum
    await nmrium.page.click(
      '_react=ShowHideSpectrumButton >> _react=FaEye >> nth=0',
    );
    await expect(
      nmrium.page.locator('_react=ContoursPaths[sign="positive"]'),
    ).toBeHidden();
    await expect(
      nmrium.page.locator('_react=ContoursPaths[sign="negative"]'),
    ).toBeVisible();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(1);

    // Hide negative spectrum
    await nmrium.page.click(
      '_react=ShowHideSpectrumButton >> _react=FaEye >> nth=1',
    );
    await expect(
      nmrium.page.locator('_react=ContoursPaths[sign="positive"]'),
    ).toBeHidden();
    await expect(
      nmrium.page.locator('_react=ContoursPaths[sign="negative"]'),
    ).toBeHidden();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(0);
    // Show positive spectrum
    await nmrium.page.click(
      '_react=ShowHideSpectrumButton >> _react=FaEye >> nth=0',
    );
    await expect(
      nmrium.page.locator('_react=ContoursPaths[sign="positive"]'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('_react=ContoursPaths[sign="negative"]'),
    ).toBeHidden();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(1);

    // Show negative spectrum
    await nmrium.page.click(
      '_react=ShowHideSpectrumButton >> _react=FaEye >> nth=1',
    );
    await expect(
      nmrium.page.locator('_react=ContoursPaths[sign="positive"]'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('_react=ContoursPaths[sign="negative"]'),
    ).toBeVisible();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(2);
  });
  await test.step('Delete 1H tab', async () => {
    // Go to 1H tab
    await nmrium.page.click('_react=SpectrumsTabs >> _react=Tab[tabid="1H"]');

    await nmrium.page.click('_react=Button[toolTip="Delete selected spectra"]');
    //confirm delete the selected
    await nmrium.page.click('_react=ConfirmationDialog >> text=Yes');

    // Check tabs
    const Tabs = nmrium.page.locator('_react=SpectrumListPanel >> _react=Tab');
    await expect(Tabs).toHaveCount(1);
    await expect(Tabs).toHaveText('1H,1H');
    // Check top spectrum
    await expect(nmrium.page.locator('_react=Top1DChart')).toBeHidden();
    // Check left spectrum
    await expect(nmrium.page.locator('_react=Left1DChart')).toBeHidden();
    // Check two Contours
    await expect(
      nmrium.page.locator('_react=ContoursPaths[sign="positive"]'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('_react=ContoursPaths[sign="negative"]'),
    ).toBeVisible();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(2);
  });
  await test.step('Add projection', async () => {
    // Click add missing projection btn
    await nmrium.page.click('_react=Button[toolTip="Add missing projection"]');

    // Check tabs
    const Tabs = nmrium.page.locator('_react=SpectrumListPanel >> _react=Tab');
    await expect(Tabs).toHaveCount(2);
    await expect(Tabs.first()).toHaveText('1H');
    await expect(Tabs.last()).toHaveText('1H,1H');
    // Check top spectrum
    await expect(nmrium.page.locator('_react=Top1DChart')).toBeVisible();
    // Check left spectrum
    await expect(nmrium.page.locator('_react=Left1DChart')).toBeVisible();
    // Check two Contours
    await expect(
      nmrium.page.locator('_react=ContoursPaths[sign="positive"]'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('_react=ContoursPaths[sign="negative"]'),
    ).toBeVisible();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(2);
  });
});

test('show/hide spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);

  await test.step('Open Coffee spectrum', async () => {
    await nmrium.page.click('li >> text=Multiple spectra');
    await nmrium.page.click('li >> text=Coffee');
    // Wait the spectrum to load
    await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(13);
  });
  await test.step('Check hide spectrums', async () => {
    // Hide positive spectrum
    await nmrium.page.click(
      '_react=ShowHideSpectrumButton >> _react=FaEye >> nth=0',
    );
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(12);

    // Hide negative spectrum
    await nmrium.page.click(
      '_react=ShowHideSpectrumButton >> _react=FaEye >> nth=1',
    );
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(11);
    // Show positive spectrum
    await nmrium.page.click(
      '_react=ShowHideSpectrumButton >> _react=FaEye >> nth=0',
    );
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(12);

    // Show negative spectrum
    await nmrium.page.click(
      '_react=ShowHideSpectrumButton >> _react=FaEye >> nth=1',
    );
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(13);
  });
});

test('Export source from 1H spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await test.step('Load 1H spectrum', async () => {
    await nmrium.open1D();
  });
  await test.step('Open Save as window ', async () => {
    await nmrium.clickTool('exportAs');
    await nmrium.page.click('_react=DropdownMenu  >> text=Save data as');
  });
  await test.step('Check include data options', async () => {
    const fields = nmrium.page.locator('_react=ModalContent >> _react=Field');
    await expect(fields).toHaveCount(3);

    const disabledFields = nmrium.page.locator(
      '_react=ModalContent >> _react=Field[disabled=true]',
    );
    await expect(disabledFields).toHaveCount(0);
  });
  await test.step('Check export Raw Data', async () => {
    const downloadPromise = nmrium.page.waitForEvent('download');
    await nmrium.page.click(
      '_react=ModalContent >> _react=Field[value="ROW_DATA"]',
    );
    await nmrium.page.click(
      '_react=ModalContent >> _react=Button >> text=Save',
    );
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    expect(stream).not.toBeNull();
    const data: any = await new Promise((resolve) => {
      const chunks: any[] = [];
      stream?.on('data', (chunk) => chunks.push(chunk));
      stream?.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const { data } = JSON.parse(buffer.toString());
        resolve(data);
      });
    });
    expect(data).not.toBeUndefined();
    // TODO: Save raw data should not have source property
    expect(data.source).toBeUndefined();
    expect(data.spectra[0].data).not.toBeUndefined();
  });
  await test.step('Check export DATA SOURCE', async () => {
    const downloadPromise = nmrium.page.waitForEvent('download');
    await nmrium.clickTool('exportAs');
    await nmrium.page.click('_react=DropdownMenu  >> text=Save data as');
    await nmrium.page.click(
      '_react=ModalContent >> _react=Field[value="DATA_SOURCE"]',
    );
    await nmrium.page.click(
      '_react=ModalContent >> _react=Button >> text=Save',
    );
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    expect(stream).not.toBeNull();
    const data: any = await new Promise((resolve) => {
      const chunks: any[] = [];
      stream?.on('data', (chunk) => chunks.push(chunk));
      stream?.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const { data } = JSON.parse(buffer.toString());
        resolve(data);
      });
    });
    expect(data).not.toBeUndefined();
    expect(data.source).not.toBeUndefined();
    expect(data.spectra[0].data).toBeUndefined();
  });
  await test.step('Check export NO Data', async () => {
    const downloadPromise = nmrium.page.waitForEvent('download');
    await nmrium.clickTool('exportAs');
    await nmrium.page.click('_react=DropdownMenu >> text=Save data as');
    await nmrium.page.click(
      '_react=ModalContent >> _react=Field[value="NO_DATA"]',
    );
    await nmrium.page.click(
      '_react=ModalContent >> _react=Button >> text=Save',
    );
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    expect(stream).not.toBeNull();
    const data: any = await new Promise((resolve) => {
      const chunks: any[] = [];
      stream?.on('data', (chunk) => chunks.push(chunk));
      stream?.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const { data } = JSON.parse(buffer.toString());
        resolve(data);
      });
    });
    expect(data).toBeUndefined();
  });
});

test('Export source from imported spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await test.step('Drag and drop spectrum', async () => {
    await nmrium.page.setInputFiles(
      '_react=DropZone >> input[type=file]',
      'test-e2e/data/ethylbenzene-1h.jdx',
    );
  });
  await test.step('Open Save as window ', async () => {
    await nmrium.clickTool('exportAs');
    await nmrium.page.click('_react=DropdownMenu  >> text=Save data as');
  });
  await test.step('Check include data options', async () => {
    const fields = nmrium.page.locator('_react=ModalContent >>_react=Field');
    await expect(fields).toHaveCount(3);
    const disabledFields = nmrium.page.locator(
      '_react=ModalContent >>_react=Field[disabled=true]',
    );
    await expect(disabledFields).toHaveCount(1);
    await expect(disabledFields).toHaveAttribute('value', 'DATA_SOURCE');
  });
  await test.step('Check export Raw Data', async () => {
    const downloadPromise = nmrium.page.waitForEvent('download');
    await nmrium.page.click(
      '_react=ModalContent >> _react=Field[value="ROW_DATA"]',
    );
    await nmrium.page.click(
      '_react=ModalContent >> _react=Button >> text=Save',
    );
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    expect(stream).not.toBeNull();
    const data: any = await new Promise((resolve) => {
      const chunks: any[] = [];
      stream?.on('data', (chunk) => chunks.push(chunk));
      stream?.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const { data } = JSON.parse(buffer.toString());
        resolve(data);
      });
    });
    // TODO: Save raw data should not have source property
    expect(data).not.toBeUndefined();
    expect(data.source).toBeUndefined();
    expect(data.spectra[0].data).not.toBeUndefined();
  });
  await test.step('Check export NO Data', async () => {
    const downloadPromise = nmrium.page.waitForEvent('download');
    await nmrium.clickTool('exportAs');
    await nmrium.page.click('_react=DropdownMenu >> text=Save data as');
    await nmrium.page.click(
      '_react=ModalContent >> _react=Field[value="NO_DATA"]',
    );
    await nmrium.page.click(
      '_react=ModalContent >> _react=Button >> text=Save',
    );
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    expect(stream).not.toBeNull();
    const data: any = await new Promise((resolve) => {
      const chunks: any[] = [];
      stream?.on('data', (chunk) => chunks.push(chunk));
      stream?.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const { data } = JSON.parse(buffer.toString());
        resolve(data);
      });
    });
    expect(data).toBeUndefined();
  });
});

test('Multiple spectra analysis', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);

  await test.step('Open Coffee spectrum and check 13 spectra', async () => {
    await nmrium.page.click('li >> text=Multiple spectra');
    await nmrium.page.click('li >> text=Coffee');
    // Wait the spectrum to load
    await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();
    await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(13);
  });
  await test.step('Check spectra names', async () => {
    const testPremisses: Array<Promise<void>> = [];
    for (let i = 0; i < 13; i++) {
      const test = expect(
        nmrium.page.locator(
          `_react=SpectraTable >> _react=SpectrumName >> text="coffee ${
            i + 1
          }"`,
        ),
      ).toBeVisible();
      testPremisses.push(test);
    }
    await Promise.all(testPremisses);
  });
  await test.step('Check spectra colors', async () => {
    expect(await nmrium.getNumberOfDistinctColors()).toBe(13);
  });
  await test.step('Check Recolour based on spectrum name', async () => {
    await nmrium.page.click('_react=SpectraTable >> text="Spectrum Name"', {
      button: 'right',
    });
    await nmrium.page.click('text="Recolor based on distinct value"');
    expect(await nmrium.getNumberOfDistinctColors()).toBe(13);
  });
  await test.step('Check recolour based on pulse', async () => {
    await nmrium.page.click('_react=SpectraTable >> text="Pulse"', {
      button: 'right',
    });
    await nmrium.page.click('text="Recolor based on distinct value"');
    expect(await nmrium.getNumberOfDistinctColors()).toBe(1);
  });
  await test.step('Check again recolour based on spectrum name', async () => {
    await nmrium.page.click('_react=SpectraTable >> text="Spectrum Name"', {
      button: 'right',
    });
    await nmrium.page.click('text="Recolor based on distinct value"');
    expect(await nmrium.getNumberOfDistinctColors()).toBe(1);
  });
  await test.step('Check recolour based on solvent', async () => {
    await nmrium.page.click('_react=SpectraTable >> text="Solvent"', {
      button: 'right',
    });
    await nmrium.page.click('text="Recolor based on distinct value"');
    expect(await nmrium.getNumberOfDistinctColors()).toBe(1);
  });
  await test.step('Check Recolour BarButton', async () => {
    await nmrium.page.click('_react=Button[toolTip="Recolor spectra"]');
    expect(await nmrium.getNumberOfDistinctColors()).toBe(13);
  });
});
test('Load JResolv', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.page.click('li >> text=Cytisine');
  await nmrium.page.click('li >> text=jResolv cytisine');

  await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();
  await expect(nmrium.page.getByTestId('spectrum-line')).toHaveCount(2);
});
