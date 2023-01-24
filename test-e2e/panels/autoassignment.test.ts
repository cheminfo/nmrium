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

    // enter a name for the workspace
    await nmrium.page.locator('input[name="workspaceName"]').fill('test');

    // save the user workspace
    await nmrium.page.click(
      'data-test-id=save-workspace-dialog >> button >> text=Save',
    );
  });
  await test.step('check automatic assignment panel', async () => {
    await nmrium.clickPanel('Automatic Assignment');
    // Click on the automatic ranges button.
    await nmrium.page.click(
      '_react=AutomaticAssignment >> _react=SpectraAutomaticPickingButton',
    );

    // Wait for auto range to be applied.
    await nmrium.page
      .locator('_react=Range >> text=3.21')
      .waitFor({ state: 'visible' });

    await nmrium.page.click(
      '_react=AutomaticAssignment >> _react=ButtonToolTip >> nth=0',
    );

    // Wait for auto assignments process completed.
    const autoAssignmentsLoader = nmrium.page.locator('text=Auto Assignments');

    await autoAssignmentsLoader.waitFor({ state: 'visible' });
    await autoAssignmentsLoader.waitFor({ state: 'hidden' });

    await expect(
      nmrium.page.locator(
        '_react=AutomaticAssignmentTable >> _react=ReactTableRow',
      ),
    ).toHaveCount(2);
  });
});
