import { test, expect } from '@playwright/test';

import NmriumPage from '../NmriumPage';

test('should draw structure and display it with MF', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  // Open the "Structures" panel.
  await nmrium.clickPanel('Structures');

  // The SVG container should not be rendered when there are no molecules.
  await expect(nmrium.page.locator('.mol-svg-container ')).toBeHidden();
  // Click on the "Add Molecule" button.
  await nmrium.page.click('_react=ToolTip[title="Add Molecule"] >>  button');

  // Select the "aromatic ring" tool.
  await nmrium.page.click('canvas >> nth=0', {
    position: {
      x: 35,
      y: 200,
    },
  });
  // Draw the aromatic ring.
  await nmrium.page.click('canvas >> nth=1', {
    position: {
      x: 50,
      y: 50,
    },
  });
  // Save the molecule.
  await nmrium.page.click('text=Save');

  // The molecule SVG rendering should now be visible in the panel.
  await expect(
    nmrium.page.locator('.mol-svg-container #molSVG0'),
  ).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');

  // The molecular formula should now be visible in the panel.
  await expect(nmrium.page.locator('text=C6H6 - 78.11 >> nth=0')).toBeVisible();

  // The number of molecules should now be visible in the panel.
  await expect(nmrium.page.locator('text=1 / 1 >> nth=0')).toBeVisible();
});
