import { test } from '@playwright/test';

import NmriumPage from '../NmriumPage';

test('process 1d FID 13c spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await test.step('Spectra panel settings', async () => {
    await nmrium.page.click(
      '_react=AccordionItem[title="Spectra"] >> _react=ToolTip[title="preferences" i]',
    );
    await nmrium.page.click(
      '_react=AccordionItem[title="Spectra"] >> _react=ToolTip[title="Save preferences" i]',
    );
    await nmrium.clickPanel('Spectra');
  });
  await test.step('Peaks panel settings', async () => {
    await nmrium.clickPanel('Peaks');
    await nmrium.page.click(
      '_react=AccordionItem[title="Peaks"] >> _react=ToolTip[title="preferences" i]',
    );
    await nmrium.page.click(
      '_react=AccordionItem[title="Peaks"] >> _react=ToolTip[title="Save preferences" i]',
    );
    await nmrium.clickPanel('Peaks');
  });
  await test.step('Integrals panel settings', async () => {
    await nmrium.clickPanel('Integrals');
    await nmrium.page.click(
      '_react=AccordionItem[title="Integrals"] >> _react=ToolTip[title="preferences" i]',
    );
    await nmrium.page.click(
      '_react=AccordionItem[title="Integrals"] >> _react=ToolTip[title="Save preferences" i]',
    );
    await nmrium.clickPanel('Integrals');
  });
  await test.step('Ranges panel settings', async () => {
    await nmrium.clickPanel('Ranges');
    await nmrium.page.click(
      '_react=AccordionItem[title="Ranges"] >> _react=ToolTip[title="preferences" i]',
    );
    await nmrium.page.click(
      '_react=AccordionItem[title="Ranges"] >> _react=ToolTip[title="Save preferences" i]',
    );
    await nmrium.clickPanel('Ranges');
  });
});
