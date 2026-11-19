import { expect, test } from '@playwright/test';

import NmriumPage from '../NmriumPage/index.js';

test('workspaces given with an older version are migrated', async ({
  page,
}) => {
  const nmrium = await NmriumPage.create(page);

  await nmrium.openDemo('Workspaces', 'Versioned workspaces (v19)');

  const workspaceButton = nmrium.page.getByRole('button', {
    name: /^Workspace:/,
  });
  const peaksPanel = nmrium.getPanelButton('Peaks');
  const rangesPanel = nmrium.getPanelButton('Ranges / Multiplet analysis');

  // `legacyPeaks` is the requested workspace, it only displays the peaks panel.
  await expect(workspaceButton).toHaveText('Legacy peaks (v19)');
  await expect(peaksPanel).toBeVisible();
  await expect(rangesPanel).toBeHidden();

  // The second workspace of the same object is migrated as well.
  await workspaceButton.click();
  await nmrium.page
    .getByRole('button', { name: 'Legacy ranges (v19)' })
    .click();

  await expect(workspaceButton).toHaveText('Legacy ranges (v19)');
  await expect(rangesPanel).toBeVisible();
  await expect(peaksPanel).toBeHidden();
});
