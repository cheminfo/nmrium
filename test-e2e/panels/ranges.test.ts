import { test, expect } from '@playwright/test';

import NmriumPage from '../NmriumPage';
import { createPeakInRange } from '../utilities/selectRange';

async function addRange(
  nmrium: NmriumPage,
  startX: number,
  endX: number,
  count: number,
) {
  await createPeakInRange(nmrium, {
    axis: 'X',
    startX,
    endX,
  });
  await expect(nmrium.page.locator(`data-test-id=range`)).toHaveCount(count);
}

async function resizeRange(nmrium: NmriumPage) {
  const rightResizer = nmrium.page.locator(
    'data-test-id=range >> nth=0 >> _react=SVGResizerHandle >> nth=1',
  );

  const {
    x,
    height,
    width: DragElementWidth,
  } = (await rightResizer.boundingBox()) as BoundingBox;

  await nmrium.page.mouse.move(x + DragElementWidth / 2, height / 2, {
    steps: 15,
  });

  await nmrium.page.mouse.down({ button: 'left' });

  await nmrium.page.mouse.move(x + DragElementWidth / 2 + 20, height / 2, {
    steps: 15,
  });
  await nmrium.page.mouse.up();

  const greenArea = nmrium.page.locator(
    'data-test-id=range >> nth=0 >> rect >> nth=0',
  );

  const { width } = (await greenArea.boundingBox()) as BoundingBox;

  expect(width).toBe(31);
}

async function deleteRange(nmrium: NmriumPage) {
  const rightResizer = nmrium.page.locator('data-test-id=range').nth(1);

  const { x, height, width } =
    (await rightResizer.boundingBox()) as BoundingBox;
  await nmrium.page.mouse.move(x + width / 2, height / 2, { steps: 15 });
  await nmrium.page.keyboard.press('Delete');
  await expect(nmrium.page.locator('data-test-id=range')).toHaveCount(1);
}

test('Should ranges Add/resize/delete', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open1D();

  //select range tool
  await nmrium.clickTool('rangePicking');

  await test.step('Add ranges', async () => {
    //add two ranges
    await addRange(nmrium, 50, 60, 1);
    await addRange(nmrium, 110, 120, 2);
  });

  await test.step('resize one of the ranges', async () => {
    //test resize the first range
    await resizeRange(nmrium);
  });

  await test.step('delete one of the ranges', async () => {
    // test delete the second range
    await deleteRange(nmrium);
  });
});

test('Automatic ranges detection should work', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open1D();

  //select range tool
  await nmrium.clickTool('rangePicking');

  //apply auto ranges detection
  await nmrium.page.click('text=Auto ranges picking');

  expect(
    await nmrium.page.locator('data-test-id=range').count(),
  ).toBeGreaterThanOrEqual(10);
  const ranges = nmrium.page.locator(
    '_react=RangesTable >> _react=RangesTableRow',
  );

  const rangesData = [
    { s: '1.75 - 1.79', r: '0.49' },
    { s: '1.95', r: '2.05' },
    { s: '1.94', r: '2.05' },
    { s: '2.15', r: '0.07' },
    { s: '2.31 - 2.34', r: '1.01' },
  ];
  for (const [i, { s, r }] of rangesData.entries()) {
    const range = ranges.nth(i);
    await expect(range).toBeVisible();
    await expect(range).toContainText(s);
    await expect(range).toContainText(r);
  }
});
test('Multiplicity should be visible', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await test.step('Open FULL ethylbenzene 2D spectrum', async () => {
    await nmrium.page.click('li >> text=General');
    await nmrium.page.click('li >> text=FULL ethylbenzene');
  });
  await test.step('Apply auto ranges', async () => {
    //select range tool
    await nmrium.clickTool('rangePicking');

    //apply auto ranges detection
    await nmrium.page.click('text=Auto ranges picking');
  });
  await test.step('Check multiplicity tree tool', async () => {
    // Check that the multiplicity tree btn is off
    await expect(
      nmrium.page.locator(
        '_react=ToolTip[title="Show Multiplicity Trees in Spectrum"] >> .toggle-active',
      ),
    ).toBeHidden();
    //show multiplicity trees
    await nmrium.page.click(
      '_react=ToolTip[title="Show Multiplicity Trees in Spectrum"] >>  button',
    );
    // Check that the multiplicity tree btn is on
    await expect(
      nmrium.page.locator(
        '_react=ToolTip[title="Hide Multiplicity Trees in Spectrum"] >> .toggle-active',
      ),
    ).toBeVisible();
    // Check multiplicity tree is visible
    expect(
      await nmrium.page.locator('_react=MultiplicityTree').count(),
    ).toBeGreaterThan(0);
  });
  await test.step('Check that multiplicity tree btn save state', async () => {
    // Change spectra to 2D
    await nmrium.page.click(
      '_react=SpectrumsTabs >> _react=InternalTab[tablabel="1H,1H"]',
    );
    // Return to 1D spectra
    await nmrium.page.click(
      '_react=SpectrumsTabs >> _react=InternalTab[tablabel="1H"]',
    );

    //open ranges panel
    await nmrium.clickPanel('Ranges');

    // Check that MultiplicityTree btn still on
    await expect(
      nmrium.page.locator(
        '_react=ToolTip[title="Hide Multiplicity Trees in Spectrum"] >> .toggle-active',
      ),
    ).toBeVisible();
  });
});
test('Range state', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await test.step('Open FULL ethylbenzene 2D spectrum', async () => {
    await nmrium.page.click('li >> text=General');
    await nmrium.page.click('li >> text=Linked jcamp');
  });
  await test.step('Apply auto ranges', async () => {
    //select range tool
    await nmrium.clickTool('rangePicking');

    //apply auto ranges detection
    await nmrium.page.click('text=Auto ranges picking');
  });
  await test.step('Active range tools', async () => {
    // Check that the integrals btn is on
    await expect(
      nmrium.page.locator(
        '_react=ToolTip[title="Hide integrals"] >> .toggle-active',
      ),
    ).toBeVisible();
    // Check that the multiplicity tree btn is off
    await expect(
      nmrium.page.locator(
        '_react=ToolTip[title="Show Multiplicity Trees in Spectrum"] >> .toggle-active',
      ),
    ).toBeHidden();

    // Check range integral
    expect(
      await nmrium.page.locator('_react=RangeIntegral').count(),
    ).toBeGreaterThan(0);

    // Check multiplicity tree
    await expect(nmrium.page.locator('_react=MultiplicityTree')).toBeHidden();

    //show multiplicity trees
    await nmrium.page.click(
      '_react=ToolTip[title="Show Multiplicity Trees in Spectrum"] >>  button',
    );
    // Check that the multiplicity tree btn is on
    await expect(
      nmrium.page.locator(
        '_react=ToolTip[title="Hide Multiplicity Trees in Spectrum"] >> .toggle-active',
      ),
    ).toBeVisible();
    // Check multiplicity tree is visible
    expect(
      await nmrium.page.locator('_react=MultiplicityTree').count(),
    ).toBeGreaterThan(0);
  });
  await test.step('Change active spectrum', async () => {
    // Change spectra
    await nmrium.page.click(
      '_react=SpectrumsTabs >> _react=SpectrumListItem >> nth=0',
    );

    //apply auto ranges detection
    await nmrium.page.click('text=Auto ranges picking');

    // Check that the integrals btn is on
    await expect(
      nmrium.page.locator(
        '_react=ToolTip[title="Hide integrals"] >> .toggle-active',
      ),
    ).toBeVisible();
    // Check that the multiplicity tree btn is off
    await expect(
      nmrium.page.locator(
        '_react=ToolTip[title="Show Multiplicity Trees in Spectrum"] >> .toggle-active',
      ),
    ).toBeHidden();

    // Check range integral
    expect(
      await nmrium.page.locator('_react=RangeIntegral').count(),
    ).toBeGreaterThan(0);

    // Check multiplicity tree
    await expect(nmrium.page.locator('_react=MultiplicityTree')).toBeHidden();

    // Show j graph
    await nmrium.page.click('_react=ToolTip[title="Show J Graph"] >>  button');

    // Check multiplicity tree
    await expect(nmrium.page.locator('_react=JGraph')).toBeVisible();

    // Hide range integral
    await nmrium.page.click(
      '_react=ToolTip[title="Hide integrals"] >>  button',
    );
    // Check that the integrals btn is off
    await expect(
      nmrium.page.locator(
        '_react=ToolTip[title="Hide integrals"] >> .toggle-active',
      ),
    ).toBeHidden();
    // Check range integral
    await expect(nmrium.page.locator('_react=RangeIntegral')).toBeHidden();
  });
  await test.step('Check that first spectrum range state saved', async () => {
    // Change spectra
    await nmrium.page.click(
      '_react=SpectrumsTabs >> _react=SpectrumListItem >> nth=1',
    );
    // Check that the integrals btn is on
    await expect(
      nmrium.page.locator(
        '_react=ToolTip[title="Hide integrals"] >> .toggle-active',
      ),
    ).toBeVisible();
    // Check that the multiplicity tree btn is on
    await expect(
      nmrium.page.locator(
        '_react=ToolTip[title="Hide Multiplicity Trees in Spectrum"] >> .toggle-active',
      ),
    ).toBeVisible();

    // Check range integrals
    expect(
      await nmrium.page.locator('_react=RangeIntegral').count(),
    ).toBeGreaterThan(0);
    // Check multiplicity tree is visible
    expect(
      await nmrium.page.locator('_react=MultiplicityTree').count(),
    ).toBeGreaterThan(0);
  });
});
