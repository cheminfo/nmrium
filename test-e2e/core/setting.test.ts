import { expect, test } from '@playwright/test';

import NMriumPage from '../NmriumPage/index.js';

test('should Change the visibility of the panels', async ({ page }) => {
  const nmrium = await NMriumPage.create(page);

  // navigate to "1H spectrum test" example
  await nmrium.open1D();

  //hold a locator reference to database panel
  const databaseLocator = nmrium.getPanelButton('databasePanel');

  await test.step('Open general setting and change the "database panel" visibility to true', async () => {
    await nmrium.openGeneralSettings();

    //click on the display tab
    await nmrium.page
      .getByRole('dialog')
      .getByRole('tab', { name: 'Panels', exact: true })
      .click();

    //change panel status to active (displays the panel in the accordion panels and the right bar )
    await nmrium.changePanelStatus('Databases', 'active');

    await nmrium.saveWorkspaceModal('test');

    // Check that the database panel is visible after saving the changes in the general setting.
    await expect(databaseLocator).toBeVisible();
  });

  //Switch to another example from the same workspace to test if the database panel still visible or not
  await test.step('"database panel" should still visible after switching  to another 1D example with "default" workspace', async () => {
    await nmrium.openDemo('Simple spectra', '1H ethylbenzene');
    await expect(databaseLocator).toBeVisible();
  });

  //reload the page to test if database panel still visible or not
  await test.step('"database panel" should still be visible after reloading the page', async () => {
    // reload the page
    await nmrium.page.reload();
    // reload the page

    //check if the database panel is visible or not
    await expect(databaseLocator).toBeVisible();
  });

  //Switch to another example from with "exercise" workspace to test if the database panel still visible or not
  await test.step('"database panel" should not be visible after switching to "exercise" workspace', async () => {
    // navigate to "Exercise 1" example
    await nmrium.openDemo('Workspaces', 'Exercise 1');

    //check if the database panel is hidden or not
    await expect(databaseLocator).toBeHidden();
  });

  await test.step('"database panel" should be visible after switching  back to "default" workspace', async () => {
    // navigate to "1H spectrum test" example
    await nmrium.open1D();

    //check if the database panel is visible or not
    await expect(databaseLocator).toBeVisible();
  });
});
