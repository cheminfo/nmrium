import { test, expect } from '@playwright/test';

import NmriumPage from '../NmriumPage';

test('automatic assignment panel', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await test.step('open 1H ethylvinylether spectrum', async () => {
    await nmrium.page.click('li >> text=General');
    await nmrium.page.click('li >> text=1H ethylvinylether >> nth=0');
    await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();
  });
  await test.step('activate automatic assignment panel', async () => {
    await nmrium.page.click('_react=ToolbarItem[id="general-settings"]');
    await nmrium.page.click('_react=Draggable >> text=Panels');
    // scroll to the bottom of the panel
    await nmrium.page.click(
      '_react=Draggable >> _react=ReactTable >> tr[role="row"] >> nth=13 >> td[role="cell"] >> nth=2 >> input',
    );
    await nmrium.page.click('_react=Draggable >> text=Save');
  });
  await test.step('check automatic assignment panel', async () => {
    await nmrium.clickPanel('Automatic Assignment');
    await nmrium.page.click(
      '_react=AutomaticAssignment >> _react=SpectraAutomaticPickingButton',
    );

    // wait for auto range to be applied
    await nmrium.page.waitForTimeout(1000);
    await nmrium.page.click(
      '_react=AutomaticAssignment >> _react=ButtonToolTip >> nth=0',
    );

    // wait for auto assignment to be applied
    await nmrium.page.waitForTimeout(1000);
    await expect(
      nmrium.page.locator(
        '_react=AutomaticAssignment >> _react=ReactTable >> tr[role="row"]',
      ),
    ).toHaveCount(3);
  });
});
