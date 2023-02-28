import { test, expect } from '@playwright/test';

import NmriumPage from '../NmriumPage';

test('Should 1d spectrum hide/show', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open1D();

  const spectrumButtonLocator = nmrium.page.locator(
    'data-test-id=hide-show-spectrum-button',
  );
  const spectrumLineLocator = nmrium.page.locator('data-test-id=spectrum-line');

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

  const boundingBox = (await nmrium.viewerLocator.boundingBox()) as BoundingBox;

  const cursorStartX = boundingBox.x + boundingBox.width / 2;
  const cursorStartY = boundingBox.y + boundingBox.height / 2;
  const previousPath = (await nmrium.page.getAttribute(
    'data-test-id=spectrum-line',
    'd',
  )) as string;

  await nmrium.page.mouse.move(cursorStartX, cursorStartY, { steps: 15 });
  await nmrium.page.mouse.down();
  await nmrium.page.mouse.move(cursorStartX + 100, cursorStartY, {
    steps: 15,
  });
  await nmrium.page.mouse.up();

  const path = (await nmrium.page.getAttribute(
    'data-test-id=spectrum-line',
    'd',
  )) as string;

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

  const spectrumLineLocator = nmrium.page.locator(
    'data-test-id=spectrum-line >> nth=0',
  );

  // deactivate spectrum
  await spectrumButtonLocator.click();

  // should spectra still visible
  await expect(spectrumLineLocator).toBeVisible();
});

test('2d spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);

  await test.step('Open COSY ethylbenzene 2D spectrum', async () => {
    await nmrium.page.click('li >> text=General');
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
      nmrium.page.locator(
        'data-test-id=spectrum-line >> _react=Line[display.color="#7c2353"]',
      ),
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
      nmrium.page.locator(
        'data-test-id=spectrum-line >> _react=Line[display.color="#ddb1c9ff"]',
      ),
    ).toBeVisible();

    // Close color picker
    await nmrium.viewerLocator.click({ force: true });
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
    await expect(nmrium.page.locator('data-test-id=spectrum-line')).toHaveCount(
      2,
    );
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
    await nmrium.viewerLocator.click({ force: true });
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
    await expect(nmrium.page.locator('data-test-id=spectrum-line')).toHaveCount(
      1,
    );

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
    await expect(nmrium.page.locator('data-test-id=spectrum-line')).toHaveCount(
      0,
    );
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
    await expect(nmrium.page.locator('data-test-id=spectrum-line')).toHaveCount(
      1,
    );

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
    await expect(nmrium.page.locator('data-test-id=spectrum-line')).toHaveCount(
      2,
    );
  });
  await test.step('Delete 1H tab', async () => {
    // Go to 1H tab
    await nmrium.page.click('_react=SpectrumsTabs >> _react=Tab[tabid="1H"]');
    // Delete 1H Spectrum item
    await nmrium.page.click('_react=SpectraTable >> _react=ReactTableRow ', {
      button: 'right',
    });
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
    await expect(nmrium.page.locator('data-test-id=spectrum-line')).toHaveCount(
      2,
    );
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
    await expect(nmrium.page.locator('data-test-id=spectrum-line')).toHaveCount(
      2,
    );
  });
});

test('show/hide spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);

  await test.step('Open Coffee spectrum', async () => {
    await nmrium.page.click('li >> text=General');
    await nmrium.page.click('li >> text=Coffee');
    // Wait the spectrum to load
    await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();
    await expect(nmrium.page.locator('data-test-id=spectrum-line')).toHaveCount(
      13,
    );
  });
  await test.step('Check hide spectrums', async () => {
    // Hide positive spectrum
    await nmrium.page.click(
      '_react=ShowHideSpectrumButton >> _react=FaEye >> nth=0',
    );
    await expect(nmrium.page.locator('data-test-id=spectrum-line')).toHaveCount(
      12,
    );

    // Hide negative spectrum
    await nmrium.page.click(
      '_react=ShowHideSpectrumButton >> _react=FaEye >> nth=1',
    );
    await expect(nmrium.page.locator('data-test-id=spectrum-line')).toHaveCount(
      11,
    );
    // Show positive spectrum
    await nmrium.page.click(
      '_react=ShowHideSpectrumButton >> _react=FaEye >> nth=0',
    );
    await expect(nmrium.page.locator('data-test-id=spectrum-line')).toHaveCount(
      12,
    );

    // Show negative spectrum
    await nmrium.page.click(
      '_react=ShowHideSpectrumButton >> _react=FaEye >> nth=1',
    );
    await expect(nmrium.page.locator('data-test-id=spectrum-line')).toHaveCount(
      13,
    );
  });
});
