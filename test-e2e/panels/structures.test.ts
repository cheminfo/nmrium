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
  await test.step('Add ring molecule', async () => {
    // Click on the "Add Molecule" button.
    await nmrium.page.click('data-test-id=panel-structures-button-add');

    // Select the "ring" tool.
    await nmrium.page.click('canvas >> nth=0', {
      position: {
        x: 35,
        y: 200,
      },
    });
    // Draw the ring.
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
    await expect(nmrium.page.locator('text=C6H6 - 78.11')).toBeVisible();

    // The number of molecules should now be visible in the panel.
    await expect(nmrium.page.locator('text=1 / 1')).toBeVisible();
  });

  await test.step('Add a second molecule and check the visibility', async () => {
    // Click on the "Add Molecule" button.
    await nmrium.page.click('data-test-id=panel-structures-button-add');

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
      nmrium.page.locator('.mol-svg-container #molSVG1'),
    ).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    await expect(
      nmrium.page.locator('.mol-svg-container #molSVG1'),
    ).toBeVisible();

    // The molecular formula should now be visible in the panel.
    await expect(nmrium.page.locator('text=C6H12 - 84.16')).toBeVisible();

    // The number of molecules should now be visible in the panel.
    await expect(nmrium.page.locator('text=2 / 2')).toBeVisible();
  });
  await test.step('Switch between molecules', async () => {
    // Start with the second molecule.
    await expect(nmrium.page.locator('text=2 / 2')).toBeVisible();
    await expect(nmrium.page.locator('text=C6H12 - 84.16')).toBeVisible();

    // Go to the previous molecule.
    await nmrium.page.click('_react=Arrow[direction="left"]');

    // Check selected molecule number.
    await expect(nmrium.page.locator('text=1 / 2')).toBeVisible();

    // Check selected molecule formula.
    await expect(nmrium.page.locator('text=C6H6 - 78.11')).toBeVisible();

    // Go to the next molecule.
    await nmrium.page.click('_react=Arrow[direction="right"]');
    // Check selected molecule number.
    await expect(nmrium.page.locator('text=2 / 2')).toBeVisible();

    // Check selected molecule formula.
    await expect(nmrium.page.locator('text=C6H12 - 84.16')).toBeVisible();
  });
});

test('molecules 1H spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open1D();

  await test.step('open Structures panel', async () => {
    await nmrium.clickPanel('Structures');
  });

  await test.step('check existing molecule', async () => {
    // The molecule SVG rendering should now be visible in the panel.
    await expect(
      nmrium.page.locator('.mol-svg-container #molSVG0'),
    ).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    await expect(
      nmrium.page.locator('.mol-svg-container #molSVG0'),
    ).toBeVisible();

    // Check the existing molecular formula.
    await expect(nmrium.page.locator('text=C11H14N2O - 190.25')).toBeVisible();

    // Check the existing number of molecules.
    await expect(nmrium.page.locator('text=1 / 1')).toBeVisible();
  });
  await test.step('Add ring molecule and check the visibility', async () => {
    // Click on the "Add Molecule" button.
    await nmrium.page.click('data-test-id=panel-structures-button-add');

    // Select the "ring" tool.
    await nmrium.page.click('canvas >> nth=0', {
      position: {
        x: 35,
        y: 200,
      },
    });
    // Draw the ring.
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
      nmrium.page.locator('.mol-svg-container #molSVG1'),
    ).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    await expect(
      nmrium.page.locator('.mol-svg-container #molSVG1'),
    ).toBeVisible();

    // Check the molecular formula.
    await expect(nmrium.page.locator('text=C6H6 - 78.11')).toBeVisible();

    // Check the number of molecules.
    await expect(nmrium.page.locator('text=2 / 2')).toBeVisible();
  });

  await test.step('Add a third molecule and check the visibility', async () => {
    // Click on the "Add Molecule" button.
    await nmrium.page.click('data-test-id=panel-structures-button-add');

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
      nmrium.page.locator('.mol-svg-container #molSVG2'),
    ).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    await expect(
      nmrium.page.locator('.mol-svg-container #molSVG2'),
    ).toBeVisible();

    // Check the molecular formula.
    await expect(nmrium.page.locator('text=C6H12 - 84.16')).toBeVisible();

    // Check the number of molecules.
    await expect(nmrium.page.locator('text=3 / 3')).toBeVisible();
  });
  await test.step('Switch between molecules', async () => {
    // Start with the third molecule.
    await expect(nmrium.page.locator('text=3 / 3')).toBeVisible();
    await expect(nmrium.page.locator('text=C6H12 - 84.16')).toBeVisible();

    // Go to the previous molecule.
    await nmrium.page.click('_react=Arrow[direction="left"]');

    // Check selected molecule number.
    await expect(nmrium.page.locator('text=2 / 3')).toBeVisible();

    // Check selected molecule formula.
    await expect(nmrium.page.locator('text=C6H6 - 78.11')).toBeVisible();

    // Go to the previous molecule.
    await nmrium.page.click('_react=Arrow[direction="left"]');

    // Check selected molecule number.
    await expect(nmrium.page.locator('text=1 / 3')).toBeVisible();
    // Check selected molecule formula.
    await expect(nmrium.page.locator('text=C11H14N2O - 190.25')).toBeVisible();

    // Go to the next molecule.
    await nmrium.page.click('_react=Arrow[direction="right"]');
    // Check selected molecule number.
    await expect(nmrium.page.locator('text=2 / 3')).toBeVisible();

    // Check selected molecule formula.
    await expect(nmrium.page.locator('text=C6H6 - 78.11')).toBeVisible();
  });
  await test.step('check Float Molecule', async () => {
    // Click on Float molecule button.
    await nmrium.page.click('_react=ToggleButton[popupTitle="Float Molecule"]');
    const floatingMolecule = nmrium.page.locator('#molSVG');
    await expect(floatingMolecule).toBeVisible();
  });
  await test.step('check Float Molecule disappear on switch ', async () => {
    // Go to the previous molecule.
    await nmrium.page.click('_react=ToolTip[title="Delete Molecule"]');

    await expect(nmrium.page.locator('#molSVG')).toBeHidden();
  });
});
