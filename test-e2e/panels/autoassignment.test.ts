import { expect, test } from '@playwright/test';

import NmriumPage from '../NmriumPage/index.js';

test('automatic assignment panel', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await test.step('open 1H ethylvinylether spectrum', async () => {
    await nmrium.page.click('li >> text=Simple spectra');
    await nmrium.page.click('li >> text=1H ethylvinylether');
    await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();
  });
  await test.step('activate automatic assignment panel', async () => {
    await nmrium.page.click('_react=ToolbarItem[id="general-settings"]');
    await nmrium.page.getByRole('tablist').locator('text=Panels').click();

    //change panel status to active (displays the panel in the accordion panels and the right bar )
    await nmrium.changePanelStatus('Automatic assignment panel', 'active');

    await nmrium.saveWorkspaceModal('test');
  });
  await test.step('check automatic assignment panel', async () => {
    await nmrium.clickPanel('Automatic assignment');
    // Click on the automatic ranges button.
    await nmrium.page.click(
      '_react=AutomaticAssignment >> _react=SpectraAutomaticPickingButton',
    );

    // Wait for auto range to be applied.
    await expect(nmrium.page.locator('_react=Range')).toHaveCount(5);

    await nmrium.getToolbarLocatorByTitle('Automatic assignment').click();

    // Wait for auto assignments process completed.
    const progressLocator = nmrium.page.locator('text=Auto Assignments');
    await expect(progressLocator).toBeVisible();

    // 10-seconds default can be short for CI runner
    await expect(progressLocator).toBeHidden({ timeout: 20 * 1000 });

    await expect(
      nmrium.page.locator('_react=AutomaticAssignmentTable >> text=0.75'),
    ).toHaveCount(2);
  });
});
