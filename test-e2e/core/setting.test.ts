import { test, expect } from '@playwright/test';

import NMriumPage from '../NmriumPage';

test('should Change the visibility of the panels', async ({ page }) => {
  const nmrium = await NMriumPage.create(page);

  // navigate to "1H spectrum test" example
  await nmrium.page.click('li >> text=General');
  await nmrium.page.click('li >> text=1H spectrum test');

  //hold a locator reference to database panel
  const databaseLocator = nmrium.page.locator(
    '_react=AccordionItem[title="Databases"]',
  );

  await test.step(
    'Open general setting and change the "database panel" visibility to true',
    async () => {
      //open general setting
      await nmrium.clickTool('general-settings');

      //click on the display tab
      await nmrium.page.click('data-test-id=tab-display');

      //change  the checkbox value to tru
      await nmrium.page
        .locator(':text("Databases panel")  + td > div > input')
        .click();

      // save changes
      await nmrium.page.click('text=Save');

      //check if the database panel is visible after saving the changes in the general setting
      await expect(databaseLocator).toBeVisible();
    },
  );

  //Switch to another example from the same workspace to test if the database panel still visible or not
  await test.step(
    '"database panel" should still visible after switching  to another 1D example with "default" workspace',
    async () => {
      await nmrium.page.click('li >> text=1H ethylbenzene');
      await expect(databaseLocator).toBeVisible();
    },
  );

  //reload the page to test if database panel still visible or not
  await test.step(
    '"database panel" should still be visible after reloading the page',
    async () => {
      // reload the page
      await nmrium.page.reload();
      // reload the page

      //check if the database panel is visible or not
      await expect(databaseLocator).toBeVisible();
    },
  );

  //Switch to another example from with "exercise" workspace to test if the database panel still visible or not
  await test.step(
    '"database panel" should not be visible after switching to "exercise" workspace',
    async () => {
      // navigate to "Exercise 1" example
      await nmrium.page.click('li >> text=Workspaces');
      await nmrium.page.click('li >> text=Exercise 1');

      //check if the database panel is hidden or not
      await expect(databaseLocator).toBeHidden();
    },
  );

  await test.step(
    '"database panel" should be visible after switching  back to "default" workspace',
    async () => {
      // navigate to "1H spectrum test" example
      await nmrium.page.click('li >> text=General');
      await nmrium.page.click('li >> text=1H spectrum test');

      //check if the database panel is visible or not
      await expect(databaseLocator).toBeVisible();
    },
  );
});
