import { expect, test } from '@playwright/test';

import NmriumPage from '../NmriumPage/index.js';

test('Matrix generation panel', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);

  await test.step('open 1H ethylvinylether spectrum', async () => {
    await nmrium.openDemo('Simple spectra', '1H ethylvinylether');
    await expect(nmrium.page.locator('#nmrSVG')).toBeVisible();
  });

  await test.step('activate matrix generation panel', async () => {
    await nmrium.page.click('_react=ToolbarItem[id="general-settings"]');
    await nmrium.page
      .getByRole('dialog')
      .getByRole('tab', { name: 'Panels', exact: true })
      .click();

    //change panel status to active (displays the panel in the accordion panels and the right bar )
    await nmrium.changePanelStatus('Matrix generation', 'active');

    await nmrium.saveWorkspaceModal('test');
  });
  await test.step('check matrix generation', async () => {
    await nmrium.clickPanel('Matrix generation');

    const panel = nmrium.getPanel('Matrix generation');
    await panel.getByLabel('From', { exact: true }).fill('0');
    await panel.getByLabel('To', { exact: true }).fill('5');
    await panel.getByLabel('Number of points', { exact: true }).fill('1000');

    await panel.getByRole('button', { name: 'Apply processing' }).click();

    const path = await nmrium.page.getAttribute('#nmrSVG path.line ', 'd');
    const pointCount = path?.match(/-?\d+(?<temp1>\.\d+)?/g)?.length ?? 0;

    expect(pointCount / 2).toEqual(1000);

    const expectedTicks = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(
      String,
    );

    await expect(
      nmrium.page
        .getByRole('group', { name: 'Horizontal axis' })
        .getByTestId('axis-primary-tick-label'),
    ).toContainText(expectedTicks);
  });
});
