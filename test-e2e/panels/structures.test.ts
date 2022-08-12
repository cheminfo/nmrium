import { test, expect } from '@playwright/test';

import NmriumPage from '../NmriumPage';

test('should draw structure and display it with MF', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  // Open the "Structures" panel.
  await nmrium.clickPanel('Structures');

  await test.step('empty panel', async () => {
    // The SVG container should not be rendered when there are no molecules.
    await expect(nmrium.page.locator('.mol-svg-container ')).toBeHidden();
  });
  await test.step('Add aromatic ring molecule', async () => {
    // Click on the "Add Molecule" button.
    await nmrium.page.click(
      'data-test-id=panel-structures-button-add >> nth=0',
    );

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
  });

  await test.step('Check the visibly of the aromatic ring molecule', async () => {
    // The molecule SVG rendering should now be visible in the panel.
    await expect(
      nmrium.page.locator('.mol-svg-container #molSVG0'),
    ).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    await expect(
      nmrium.page.locator('.mol-svg-container #molSVG0'),
    ).toBeVisible();

    // The molecular formula should now be visible in the panel.
    await expect(
      nmrium.page.locator('text=C6H6 - 78.11 >> nth=0'),
    ).toBeVisible();

    // The number of molecules should now be visible in the panel.
    await expect(nmrium.page.locator('text=1 / 1 >> nth=0')).toBeVisible();
  });

  await test.step('Add a second molecule and check the visibility', async () => {
    // Click on the "Add Molecule" button.
    await nmrium.page.click(
      'data-test-id=panel-structures-button-add >> nth=0',
    );

    // Select the "aromatic ring" tool.
    await nmrium.page.click('canvas >> nth=0', {
      position: {
        x: 35,
        y: 180,
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

    // Check the visibility.

    // The molecule SVG rendering should now be visible in the panel.
    await expect(
      nmrium.page.locator('.mol-svg-container #molSVG0'),
    ).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    await expect(
      nmrium.page.locator('.mol-svg-container #molSVG0'),
    ).toBeVisible();

    // The molecular formula should now be visible in the panel.
    await expect(
      nmrium.page.locator('text=C6H12 - 84.16 >> nth=0'),
    ).toBeVisible();

    // The number of molecules should now be visible in the panel.
    await expect(nmrium.page.locator('text=2 / 2 >> nth=0')).toBeVisible();
  });
  await test.step('Switch between molecules', async () => {
    // Start with the second molecule.
    await expect(nmrium.page.locator('text=2 / 2 >> nth=0')).toBeVisible();
    await expect(
      nmrium.page.locator('text=C6H12 - 84.16 >> nth=0'),
    ).toBeVisible();

    // Go to the previous molecule.
    await nmrium.page.click('.react-shadow-8g1a46-Arrow');

    // Check selected molecule number.
    await expect(nmrium.page.locator('text=1 / 2 >> nth=0')).toBeVisible();

    // Check selected molecule formula.
    await expect(
      nmrium.page.locator('text=C6H6 - 78.11 >> nth=0'),
    ).toBeVisible();

    // Go to the next molecule.
    await nmrium.page.click('.react-shadow-46m0r1-Arrow');
    // Check selected molecule number.
    await expect(nmrium.page.locator('text=2 / 2 >> nth=0')).toBeVisible();

    // Check selected molecule formula.
    await expect(
      nmrium.page.locator('text=C6H12 - 84.16 >> nth=0'),
    ).toBeVisible();
  });
});
