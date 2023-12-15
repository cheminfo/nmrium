import { test, expect } from '@playwright/test';

import NmriumPage from '../NmriumPage';
import { selectRange } from '../utilities/selectRange';

async function addRange(
  nmrium: NmriumPage,
  startX: number,
  endX: number,
  count: number,
) {
  await selectRange(nmrium, {
    axis: 'X',
    startX,
    endX,
  });
  await expect(nmrium.page.getByTestId(`range`)).toHaveCount(count);
}

async function shiftSignal(nmrium: NmriumPage) {
  const signalColumnLocator = nmrium.page.locator(
    '_react=RangesTable >> .editable-column-input >> nth=0 ',
  );

  await signalColumnLocator.dblclick();
  const inputLocator = signalColumnLocator.locator('input');
  await inputLocator.selectText();
  await inputLocator.type('100');
  await inputLocator.press('Enter');
  const trackerLocator = nmrium.page.locator('_react=XAxis >> text=100');
  await expect(trackerLocator).toHaveCount(1);
}

async function simulateResizeWithoutChange(nmrium: NmriumPage) {
  const rightResizer = nmrium.page
    .getByTestId('range')
    .nth(0)
    .locator('_react=SVGResizerHandle')
    .nth(1);

  await rightResizer.dblclick();

  await expect(nmrium.page.getByTestId(`range`)).toHaveCount(2);
}

async function resizeRange(nmrium: NmriumPage) {
  const rightResizer = nmrium.page
    .getByTestId('range')
    .nth(0)
    .locator('_react=SVGResizerHandle')
    .nth(1);

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

  const greenArea = nmrium.page
    .getByTestId('range')
    .nth(0)
    .locator('rect')
    .nth(0);

  const { width } = (await greenArea.boundingBox()) as BoundingBox;

  expect(width).toBeGreaterThan(29);
  expect(width).toBeLessThanOrEqual(32);
}

async function deleteRange(nmrium: NmriumPage) {
  const rangeLocator = nmrium.page.locator('_react=Range >> nth=0 ');
  await rangeLocator.hover();
  await nmrium.page.keyboard.press('Delete');
  await expect(nmrium.page.getByTestId('range')).toHaveCount(1);
}

test('Should ranges Add/resize/delete', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open1D();

  //select range tool
  await nmrium.clickTool('rangePicking');

  await test.step('Add ranges', async () => {
    //add two ranges
    await addRange(nmrium, 200, 210, 1);
    await addRange(nmrium, 110, 120, 2);
  });

  await test.step('Clicking and subsequently releasing the resizing action should not crash or add a new range', async () => {
    await simulateResizeWithoutChange(nmrium);
  });

  await test.step('resize one of the ranges', async () => {
    //test resize the first range
    await resizeRange(nmrium);
  });

  await test.step('Shift Signal', async () => {
    //test resize the first range
    await shiftSignal(nmrium);
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

  expect(await nmrium.page.getByTestId('range').count()).toBeGreaterThanOrEqual(
    10,
  );
  const ranges = nmrium.page.locator(
    '_react=RangesTable >> _react=RangesTableRow',
  );

  const rangesData = [
    { s: '1.75 - 1.79', r: '0.51' },
    { s: '1.95', r: '2.06' },
    { s: '1.94', r: '2.06' },
    { s: '2.15', r: '0.07' },
    { s: '2.31 - 2.34', r: '1.01' },
  ];

  const testPromises: Array<Promise<void>> = [];
  for (const [i, { s, r }] of rangesData.entries()) {
    const range = ranges.nth(i);
    testPromises.push(
      expect(range).toBeVisible(),
      expect(range).toContainText(s),
      expect(range).toContainText(r),
    );
  }
  await Promise.all(testPromises);
});

test('Multiplicity should be visible', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await test.step('Open FULL ethylbenzene 2D spectrum', async () => {
    await nmrium.page.click('li >> text=Simple spectra');
    await nmrium.page.click('li >> text=FULL ethylbenzene');
  });

  // switch to 1H tab.
  await nmrium.page.click('_react=SpectrumsTabs >> _react=Tab[tabid="1H"]');

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
        '_react=ToolTip[title="Show Multiplicity Trees in Spectrum" i] >> .toggle-active',
      ),
    ).toBeHidden();
    //show multiplicity trees
    await nmrium.page.click(
      '_react=ToolTip[title="Show Multiplicity Trees in Spectrum" i] >>  button',
    );
    // Check that the multiplicity tree btn is on
    await expect(
      nmrium.page.locator(
        '_react=ToolTip[title="Hide multiplicity trees in spectrum" i] >> .toggle-active',
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
      '_react=SpectrumsTabs >> _react=Tab[tabid="1H,1H"]',
    );
    // Return to 1D spectra
    await nmrium.page.click('_react=SpectrumsTabs >> _react=Tab[tabid="1H"]');

    //open ranges panel
    await nmrium.clickPanel('Ranges');

    // Check that MultiplicityTree btn still on
    await expect(
      nmrium.page.locator(
        '_react=ToolTip[title="Hide multiplicity trees in spectrum" i] >> .toggle-active',
      ),
    ).toBeVisible();
  });
});

test('Range state', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await test.step('Open FULL ethylbenzene 2D spectrum', async () => {
    await nmrium.page.click('li >> text=Various formats');
    await nmrium.page.click('li >> text=Linked jcamp');
  });

  // switch to 1H tab.
  await nmrium.page.click('_react=SpectrumsTabs >> _react=Tab[tabid="1H"]');

  await test.step('Apply auto ranges', async () => {
    //select range tool
    await nmrium.clickTool('rangePicking');

    //apply auto ranges detection
    await nmrium.page.click('text=Auto ranges picking');
  });
  await test.step('Active range tools', async () => {
    // Check that the peaks btn is off
    await expect(
      nmrium.page.locator(
        '_react=RangesPanel >> _react=ToolTip[title="Show peaks" i] >> .toggle-active',
      ),
    ).toBeHidden();
    // Check that the integrals btn is off
    await expect(
      nmrium.page.locator(
        '_react=ToolTip[title="Show integrals" i] >> .toggle-active',
      ),
    ).toBeHidden();
    // Check that the multiplicity tree btn is off
    await expect(
      nmrium.page.locator(
        '_react=ToolTip[title="Show Multiplicity Trees in Spectrum" i] >> .toggle-active',
      ),
    ).toBeHidden();

    // Check peaks within ranges are hidden
    await expect(nmrium.page.locator('_react=PeakAnnotation')).toBeHidden();
    // Check integrals within ranges are hidden
    await expect(
      nmrium.page.locator('_react=RangesIntegrals >> _react=Integral'),
    ).toBeHidden();

    // Check multiplicity tree
    await expect(nmrium.page.locator('_react=MultiplicityTree')).toBeHidden();

    //show integrals
    await nmrium.page.click(
      '_react=RangesPanel >> _react=ToolTip[title="Show peaks" i] >> button',
    );
    //show integrals
    await nmrium.page.click(
      '_react=ToolTip[title="Show integrals" i] >> button',
    );

    //show multiplicity trees
    await nmrium.page.click(
      '_react=ToolTip[title="Show Multiplicity Trees in Spectrum" i] >>  button',
    );
    // Check that the multiplicity tree btn is on
    await expect(
      nmrium.page.locator(
        '_react=ToolTip[title="Hide multiplicity trees in spectrum" i] >> .toggle-active',
      ),
    ).toBeVisible();
    // Check peaks within ranges are visible
    expect(
      await nmrium.page.locator('_react=PeakAnnotation').count(),
    ).toBeGreaterThan(0);
    // Check integrals within ranges are visible
    expect(
      await nmrium.page
        .locator('_react=RangesIntegrals >> _react=Integral')
        .count(),
    ).toBeGreaterThan(0);
    // Check multiplicity tree is visible
    expect(
      await nmrium.page.locator('_react=MultiplicityTree').count(),
    ).toBeGreaterThan(0);
  });
  await test.step('Check that first spectrum range state saved', async () => {
    // Change spectra
    await nmrium.page.click(
      '_react=SpectraTable >> _react=ReactTableRow>> nth=0',
    );
    // Change spectra
    await nmrium.page.click(
      '_react=SpectraTable >> _react=ReactTableRow >> nth=1',
    );
    // Check that the peaks btn is not active
    await expect(
      nmrium.page.locator(
        '_react=RangesPanel >> _react=ToolTip[title="Hide peaks" i]',
      ),
    ).toBeVisible();
    // Check that the integrals btn is not active
    await expect(
      nmrium.page.locator('_react=ToolTip[title="Hide integrals" i]'),
    ).toBeVisible();
    // Check that the multiplicity tree btn is on
    await expect(
      nmrium.page.locator(
        '_react=ToolTip[title="Hide multiplicity trees in spectrum" i]',
      ),
    ).toBeVisible();

    // Check range peaks
    expect(
      await nmrium.page.locator('_react=PeakAnnotation').count(),
    ).toBeGreaterThan(0);
    // Check range integrals
    expect(
      await nmrium.page
        .locator('_react=RangesIntegrals >> _react=Integral')
        .count(),
    ).toBeGreaterThan(0);
    // Check multiplicity tree is visible
    expect(
      await nmrium.page.locator('_react=MultiplicityTree').count(),
    ).toBeGreaterThan(0);
  });
});

test('Auto peak picking on all spectra', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await test.step('Open FULL ethylbenzene 2D spectrum', async () => {
    await nmrium.page.click('li >> text=Cytisine');
    await nmrium.page.click('li >> text=Full cytisine');
    await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();
  });

  await test.step('Check spectrum tabs', async () => {
    const Tabs = nmrium.page.locator('_react=SpectrumListPanel >> _react=Tab');
    await expect(Tabs).toHaveCount(4);
    await expect(Tabs.nth(0)).toHaveText('1H');
    await expect(Tabs.nth(1)).toHaveText('13C');
    await expect(Tabs.nth(2)).toHaveText('1H,1H');
    await expect(Tabs.nth(3)).toHaveText('1H,13C');
  });

  await test.step('Apply automatic picking', async () => {
    // Click on the automatic ranges button.
    await nmrium.page.click(
      '_react=SpectrumListPanel >> _react=SpectraAutomaticPickingButton',
    );
  });

  await test.step("Check 1H spectrum's ranges", async () => {
    // switch to 1H tab.
    await nmrium.page.click('_react=SpectrumsTabs >> _react=Tab[tabid="1H"]');
    //open ranges panel
    await nmrium.clickPanel('Ranges');
    await expect(nmrium.page.getByTestId('range')).toHaveCount(16);
    await expect(
      nmrium.page.locator('_react=RangesPanel >> _react=PanelHeader'),
    ).toContainText('[ 16 ]');
  });

  await test.step("Check 13C spectrum's ranges", async () => {
    // switch to 13C tab.
    await nmrium.page.click('_react=SpectrumsTabs >> _react=Tab[tabid="13C"]');
    await expect(nmrium.page.getByTestId('range')).toHaveCount(15);
    await expect(
      nmrium.page.locator('_react=RangesPanel >> _react=PanelHeader'),
    ).toContainText('[ 15 ]');
  });

  await test.step("Check 1H,1H spectrum's ranges", async () => {
    // switch to 1H,1H tab.
    await nmrium.page.click(
      '_react=SpectrumsTabs >> _react=Tab[tabid="1H,1H"]',
    );
    //open zones panel
    await nmrium.clickPanel('Zones');
    await expect(nmrium.page.locator('.zone')).toHaveCount(41);
    await expect(
      nmrium.page.locator('_react=ZonesPanel >> _react=PanelHeader'),
    ).toContainText('[ 41 ]');
  });

  await test.step("Check 1H,13C spectrum's ranges", async () => {
    // switch to 1H,13C tab.
    await nmrium.page.click(
      '_react=SpectrumsTabs >> _react=Tab[tabid="1H,13C"]',
    );
    await expect(nmrium.page.locator('.zone')).toHaveCount(15);
    await expect(
      nmrium.page.locator('_react=ZonesPanel >> _react=PanelHeader'),
    ).toContainText('[ 15 ]');

    await nmrium.page.click(
      '_react=SpectrumListPanel >> _react=ReactTableRow[key="row_1"]',
    );
    await expect(nmrium.page.locator('.zone')).toHaveCount(44);
    await expect(
      nmrium.page.locator('_react=ZonesPanel >> _react=PanelHeader'),
    ).toContainText('[ 44 ]');
  });
});

test('2D spectra reference change', async ({ page }) => {
  const xAxisDefault = [1, 2, 3, 4, 5, 6, 7, 8];
  const yAxisDefault = [0, 20, 40, 60, 80, 100, 120, 140, 160];
  const nmrium = await NmriumPage.create(page);
  await test.step('Open 2D spectrum', async () => {
    await nmrium.page.click('li >> text=Cytisine');
    await nmrium.page.click('li >> text=HSQC cytisine + 1D spectra');
    await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();
    await expect(nmrium.page.locator('.x')).toContainText(
      xAxisDefault.join(''),
    );
    await expect(nmrium.page.locator('.y')).toContainText(
      yAxisDefault.join(''),
    );
  });

  await test.step('Auto zone picking', async () => {
    await nmrium.clickTool('zonePicking');
    await nmrium.page.click('text=Auto Zones Picking');
  });

  await test.step("Check spectrum's zones", async () => {
    await expect(nmrium.page.locator('.zone')).toHaveCount(15);
    await expect(
      nmrium.page.locator('_react=ZonesPanel >> _react=PanelHeader'),
    ).toContainText('[ 15 ]');

    const x = 2.9139017520593895;
    const y = 35.65263186072366;
    await expect(
      nmrium.page.locator(
        '_react=ZonesPanel >> _react=ZonesTableRow >> nth=0 >> td >> nth=1',
      ),
    ).toHaveText(x.toFixed(2));
    await expect(
      nmrium.page.locator(
        '_react=ZonesPanel >> _react=ZonesTableRow >> nth=0 >> td >> nth=2',
      ),
    ).toHaveText(y.toFixed(2));

    await expect(
      nmrium.page.locator(
        `_react=Signal[signal.x.delta=${x}][signal.y.delta=${y}]`,
      ),
    ).toBeVisible();
  });
  await test.step('Change reference', async () => {
    const x = 1000;
    const y = 2000;
    await nmrium.page
      .locator(
        '_react=ZonesPanel >> _react=ZonesTableRow >> nth=0 >> td >> nth=1',
      )
      .dblclick();

    await nmrium.page.keyboard.type(x.toString());
    await nmrium.page.keyboard.press('Enter');

    await nmrium.page
      .locator(
        '_react=ZonesPanel >> _react=ZonesTableRow >> nth=0 >> td >> nth=2',
      )
      .dblclick();

    await nmrium.page.keyboard.type(y.toString());
    await nmrium.page.keyboard.press('Enter');

    await expect(
      nmrium.page.locator(
        '_react=ZonesPanel >> _react=ZonesTableRow >> nth=0 >> td >> nth=1',
      ),
    ).toHaveText(x.toFixed(2));
    await expect(
      nmrium.page.locator(
        '_react=ZonesPanel >> _react=ZonesTableRow >> nth=0 >> td >> nth=2',
      ),
    ).toHaveText(y.toFixed(2));

    await expect(
      nmrium.page.locator(
        `_react=Signal[signal.x.delta=${x}][signal.y.delta=${y}]`,
      ),
    ).toBeVisible();

    const xShift = 997;
    const yShift = 1960;
    const newXAxis = xAxisDefault.map((n) => n + xShift);
    const newYAxis = yAxisDefault.map((n) => n + yShift);
    await expect(nmrium.page.locator('.x')).toContainText(newXAxis.join(''));
    await expect(nmrium.page.locator('.y')).toContainText(newYAxis.join(''));
  });
});
