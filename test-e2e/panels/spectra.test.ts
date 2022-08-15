import { test, expect } from '@playwright/test';

import NmriumPage from '../NmriumPage';

test.skip('Should 1d spectrum hide/show', async ({ page }) => {
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

test.skip('Check if the color picker is visible after click on the ColorIndicator', async ({
  page,
}) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open2D();

  const sketchPicker = nmrium.page.locator('_react=ColorPicker');

  await expect(sketchPicker).toHaveCount(0);
  await nmrium.page.click('_react=ColorIndicator >> nth=0');
  await expect(sketchPicker).toHaveCount(2);
});

test.skip('Should Zoom', async ({ page }) => {
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

test.skip('Check change spectrum color, Should be white', async ({ page }) => {
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

test.skip('Should 2d deactivate spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open2D();

  const spectrumButtonLocator = nmrium.page.locator(
    'data-test-id=activate-deactivate-spectrum-button >> nth=1',
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
  });
  await test.step('Check two spectrum tabs', async () => {
    const Tabs = nmrium.page.locator(
      '_react=SpectrumListPanel >> _react=InternalTab',
    );
    await expect(Tabs).toHaveCount(2);
    await expect(Tabs.first()).toHaveText('1H');
    await expect(Tabs.last()).toHaveText('1H,1H');
  });
  await test.step('Change H1 spectrum color', async () => {
    // Check ColorIndicator initial color
    await expect(
      nmrium.page.locator('_react=ColorIndicator[color.color= "#7c2353"]'),
    ).toBeVisible();
    // Check spectrum initial color match with ColorIndicator
    await expect(
      nmrium.page.locator(
        'data-test-id=spectrum-line >> _react=Line[display.color = "#7c2353"]',
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
      nmrium.page.locator('_react=ColorIndicator[color.color= "#ddb1c9ff"]'),
    ).toBeVisible();
    // Check that spectrum color changed
    await expect(
      nmrium.page.locator(
        'data-test-id=spectrum-line >> _react=Line[display.color = "#ddb1c9ff"]',
      ),
    ).toBeVisible();

    // Close Change color modal
    await nmrium.page.click('_react=ColorIndicator');
  });
  await test.step('Change H1,H1 spectrum', async () => {
    await nmrium.page.click('_react=SpectrumListPanel >> text=1H,1H');
    await expect(nmrium.page.locator('data-test-id=spectrum-line')).toHaveCount(
      2,
    );
  });
});
