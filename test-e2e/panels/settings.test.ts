import { test } from '@playwright/test';

import NmriumPage from '../NmriumPage/index.js';

test('process 1d FID 13c spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);

  await test.step('Spectra panel settings', async () => {
    await nmrium.openPanelSettings('spectraPanel');
    await nmrium
      .getPanel('spectraPanel')
      .getByRole('toolbar', { name: 'Panel preferences toolbar', exact: true })
      .getByRole('button', { name: 'Save preferences', exact: true })
      .click();
    await nmrium.clickPanel('spectraPanel');
  });

  await test.step('Peaks panel settings', async () => {
    await nmrium.showPanel('peaksPanel');
    await nmrium.openPanelSettings('peaksPanel');
    await nmrium
      .getPanel('peaksPanel')
      .getByRole('toolbar', { name: 'Panel preferences toolbar', exact: true })
      .getByRole('button', { name: 'Save preferences', exact: true })
      .click();
    await nmrium.clickPanel('peaksPanel');
  });

  await test.step('Integrals panel settings', async () => {
    await nmrium.showPanel('integralsPanel');
    await nmrium.openPanelSettings('integralsPanel');
    await nmrium
      .getPanel('integralsPanel')
      .getByRole('toolbar', { name: 'Panel preferences toolbar', exact: true })
      .getByRole('button', { name: 'Save preferences', exact: true })
      .click();
    await nmrium.clickPanel('integralsPanel');
  });

  await test.step('Ranges panel settings', async () => {
    await nmrium.openPanelSettings('rangesPanel');
    await nmrium
      .getPanel('rangesPanel')
      .getByRole('toolbar', { name: 'Panel preferences toolbar', exact: true })
      .getByRole('button', { name: 'Save preferences', exact: true })
      .click();
    await nmrium.clickPanel('rangesPanel');
  });
});
