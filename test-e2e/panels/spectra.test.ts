import NmriumPage from '../NmriumPage';

test('Should 1d spectrum hide/show', async () => {
  const nmrium = await NmriumPage.create();
  await nmrium.open1D();

  // Click on hide/show spectrum button.
  await nmrium.page.click(
    ':nth-match([data-test-id="hide-show-spectrum-button"], 1)',
  );

  await nmrium.page.waitForTimeout(500);

  expect(
    await nmrium.page.isVisible(':nth-match([data-test-id="spectrum-line"],1)'),
  ).toBe(false);

  // Click on hide/show spectrum button.
  await nmrium.page.click(
    ':nth-match([data-test-id="hide-show-spectrum-button"], 1)',
  );

  await nmrium.page.waitForTimeout(500);

  //check if the spectrum is visible again
  expect(
    await nmrium.page.isVisible(':nth-match([data-test-id="spectrum-line"],1)'),
  ).toBe(true);
});

test('Check if the color picker is visible after click on the color-indicator', async () => {
  const nmrium = await NmriumPage.create();
  await nmrium.open2D();

  expect(await nmrium.page.isVisible('.sketch-picker')).toBe(false);
  await nmrium.page.click(':nth-match([data-test-id="color-indicator"], 2)');
  expect(await nmrium.page.isVisible('.sketch-picker')).toBe(true);
});

test('Should Zoom', async () => {
  const nmrium = await NmriumPage.create();
  await nmrium.open1D();
  const containerElemment = await nmrium.page.waitForSelector('.Pane1');

  const boundingBox = (await containerElemment?.boundingBox()) as BoundingBox;

  const cursorStartX = boundingBox.x + boundingBox.width / 2;
  const cursorStartY = boundingBox.y + boundingBox.height / 2;
  const previousPath = (await nmrium.page.getAttribute(
    ':nth-match([data-test-id="spectrum-line"],1)',
    'd',
  )) as string;

  await nmrium.page.mouse.move(cursorStartX, cursorStartY, { steps: 15 });
  await nmrium.page.mouse.down();
  await nmrium.page.mouse.move(cursorStartX + 100, cursorStartY, {
    steps: 15,
  });
  await nmrium.page.mouse.up();

  await nmrium.page.waitForTimeout(1000);

  const path = (await nmrium.page.getAttribute(
    ':nth-match([data-test-id="spectrum-line"],1)',
    'd',
  )) as string;

  expect(path.length).toBeGreaterThan(1000);
  expect(path).not.toContain('NaN');
  expect(path).not.toMatch(previousPath);
});

test('Check change spectrum color, Should be white', async () => {
  const nmrium = await NmriumPage.create();
  await nmrium.open1D();

  await nmrium.page.waitForSelector('.Pane1');

  //open Change color modal
  await nmrium.page.click(':nth-match([data-test-id="color-indicator"], 1)');

  const colorSelector = await nmrium.page.$('.sketch-picker > div');
  const boundingBox = (await colorSelector?.boundingBox()) as BoundingBox;

  await nmrium.page.mouse.click(boundingBox.x, boundingBox.y, {
    button: 'left',
  });
  await nmrium.page.waitForTimeout(1000);

  const color = (await nmrium.page.getAttribute(
    ':nth-match([data-test-id="spectrum-line"],1)',
    'stroke',
  )) as string;
  expect(color).toMatch('#ffffffff');
});
