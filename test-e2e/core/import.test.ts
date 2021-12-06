import { test } from '@playwright/test';

import NmriumPage from '../NmriumPage';

test('should load and migrate .nmrium data from version 0 to latest version', async ({
  page,
}) => {
  const nmrium = await NmriumPage.create(page);

  await nmrium.clickTool('menu-Import');

  const [fileChooser] = await Promise.all([
    nmrium.page.waitForEvent('filechooser'),
    nmrium.page.click('_react=MenuItem[id = "importFile"]'),
  ]);
  await fileChooser.setFiles('test-e2e/data/1h-version-0.nmrium');

  await nmrium.page.click('_react=InternalTab[tabid = "1H,1H"]');
});

test('should load and migrate .nmrium data from version 1 to latest version', async ({
  page,
}) => {
  const nmrium = await NmriumPage.create(page);

  await nmrium.clickTool('menu-Import');

  const [fileChooser] = await Promise.all([
    nmrium.page.waitForEvent('filechooser'),
    nmrium.page.click('_react=MenuItem[id = "importFile"]'),
  ]);
  await fileChooser.setFiles('test-e2e/data/1h-version-1-datasource.nmrium');

  await nmrium.page.click('_react=InternalTab[tabid = "1H,1H"]');
});
