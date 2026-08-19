import { expect, test } from '@playwright/test';

import NmriumPage from '../NmriumPage/index.js';

test('workspaces given with an older version are migrated', async ({
  page,
}) => {
  const nmrium = await NmriumPage.create(page);

  await nmrium.page.click('li >> text=Workspaces');
  await nmrium.page.click('li >> text=Versioned workspaces (v19)');

  const workspaceButton = nmrium.page.locator('_react=DropDownButton >> nth=0');
  const peaksPanel = nmrium.page.locator('_react=AccordionItem[title="Peaks"]');
  const rangesPanel = nmrium.page.locator(
    '_react=AccordionItem[title="Ranges / Multiplet analysis"]',
  );

  // `legacyPeaks` is the requested workspace, it only displays the peaks panel.
  await expect(workspaceButton).toHaveText('Legacy peaks (v19)');
  await expect(peaksPanel).toBeVisible();
  await expect(rangesPanel).toBeHidden();

  // The second workspace of the same object is migrated as well.
  await workspaceButton.click();
  await nmrium.page.click('span >> text=Legacy ranges (v19)');

  await expect(workspaceButton).toHaveText('Legacy ranges (v19)');
  await expect(rangesPanel).toBeVisible();
  await expect(peaksPanel).toBeHidden();
});
