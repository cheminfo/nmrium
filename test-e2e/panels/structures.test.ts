import { test, expect } from '@playwright/test';

import NmriumPage from '../NmriumPage';

test('should draw structure and display it with MF', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  // Open the "Structures" panel.
  await nmrium.clickPanel('Chemical structures');

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

test('molecules 1H spectrum', async ({ page, browserName }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open1D();

  await test.step('open Chemical structures panel', async () => {
    await nmrium.clickPanel('Chemical structures');
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
    await expect(
      nmrium.page.locator('_react=Arrow[direction="left"]'),
    ).toBeHidden();

    // Go to the next molecule.
    await nmrium.page.click('_react=Arrow[direction="right"]');
    // Check selected molecule number.
    await expect(nmrium.page.locator('text=2 / 3')).toBeVisible();

    // Check selected molecule formula.
    await expect(nmrium.page.locator('text=C6H6 - 78.11')).toBeVisible();

    // Go to the next molecule.
    await nmrium.page.click('_react=Arrow[direction="right"]');

    // Check the third molecule.
    await expect(nmrium.page.locator('text=3 / 3')).toBeVisible();
    await expect(nmrium.page.locator('text=C6H12 - 84.16')).toBeVisible();
    await expect(
      nmrium.page.locator('_react=Arrow[direction="right"]'),
    ).toBeHidden();

    // Go to the previous molecule.
    await nmrium.page.click('_react=Arrow[direction="left"]');

    // Check selected molecule number.
    await expect(nmrium.page.locator('text=2 / 3')).toBeVisible();
    // Check selected molecule formula.
    await expect(nmrium.page.locator('text=C6H6 - 78.11')).toBeVisible();
  });
  await test.step('Check molecules in integrals', async () => {
    await nmrium.clickPanel('Integrals');
    await nmrium.page.click(
      '_react=ToolTip[title="Change Integrals Sum"] >> button',
    );
    await expect(
      nmrium.page.locator('_react=Draggable >> #molSVG0'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('_react=Draggable >> text=C11H14N2O - 190.25'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('_react=Draggable >> text=New sum for H will be 14!'),
    ).toBeVisible();
    await nmrium.page.click(
      '_react=Draggable >> _react=Arrow[direction="right"]',
    );
    await expect(
      nmrium.page.locator('_react=Draggable >> #molSVG1'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('_react=Draggable >> text=C6H6 - 78.11'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('_react=Draggable >> text=New sum for H will be 6!'),
    ).toBeVisible();
    await nmrium.page.click(
      '_react=Draggable >> _react=Arrow[direction="right"]',
    );
    await expect(
      nmrium.page.locator('_react=Draggable >> #molSVG2'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('_react=Draggable >> text=C6H12 - 84.16'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('_react=Draggable >> text=New sum for H will be 12!'),
    ).toBeVisible();
    await nmrium.page.click(
      '_react=Draggable >> _react=ToolTip[title="Close"] >> button',
    );
  });
  await test.step('Check molecules in ranges', async () => {
    await nmrium.clickPanel('Ranges');
    await nmrium.page.click(
      '_react=ToolTip[title="Change Ranges Sum"] >> button',
    );
    await expect(
      nmrium.page.locator('_react=Draggable >> #molSVG0'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('_react=Draggable >> text=C11H14N2O - 190.25'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('_react=Draggable >> text=New sum for H will be 14!'),
    ).toBeVisible();
    await nmrium.page.click(
      '_react=Draggable >> _react=Arrow[direction="right"]',
    );
    await expect(
      nmrium.page.locator('_react=Draggable >> #molSVG1'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('_react=Draggable >> text=C6H6 - 78.11'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('_react=Draggable >> text=New sum for H will be 6!'),
    ).toBeVisible();
    await nmrium.page.click(
      '_react=Draggable >> _react=Arrow[direction="right"]',
    );
    await expect(
      nmrium.page.locator('_react=Draggable >> #molSVG2'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('_react=Draggable >> text=C6H12 - 84.16'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('_react=Draggable >> text=New sum for H will be 12!'),
    ).toBeVisible();
    await nmrium.page.click(
      '_react=Draggable >> _react=ToolTip[title="Close"] >> button',
    );
  });
  await test.step('Check float molecule', async () => {
    // Click on float molecule button.
    await nmrium.page.click('_react=ToolTip[title="Float Molecule"] >> button');
    // Check floated molecule.
    await expect(nmrium.page.locator('#molSVG')).toBeVisible();
  });
  await test.step('Check delete float molecule', async () => {
    // Delete molecule.
    await nmrium.page.click(
      '_react=ToolTip[title="Delete Molecule"] >> button',
    );
    // Check deleted Floated molecule.
    await expect(nmrium.page.locator('#molSVG')).toBeHidden();
    // Check selected molecule.
    await expect(nmrium.page.locator('text=1 / 2')).toBeVisible();
    await expect(nmrium.page.locator('text=C11H14N2O - 190.25')).toBeVisible();
    await expect(
      nmrium.page.locator('.mol-svg-container #molSVG0'),
    ).toBeVisible();
  });

  await test.step('Delete molecule', async () => {
    // Go to the next molecule.
    await nmrium.page.click('_react=Arrow[direction="right"]');
    // Check the second molecule.
    await expect(nmrium.page.locator('text=2 / 2')).toBeVisible();
    await expect(nmrium.page.locator('text=C6H12 - 84.16')).toBeVisible();
    await expect(
      nmrium.page.locator('.mol-svg-container #molSVG1'),
    ).toBeVisible();

    // Delete molecule.
    await nmrium.page.click(
      '_react=ToolTip[title="Delete Molecule"] >> button',
    );

    // Check selected molecule.
    await expect(nmrium.page.locator('text=1 / 1')).toBeVisible();
    await expect(nmrium.page.locator('text=C11H14N2O - 190.25')).toBeVisible();
    await expect(
      nmrium.page.locator('.mol-svg-container #molSVG0'),
    ).toBeVisible();
  });
  if (browserName === 'chromium') {
    await test.step('Check copy as molfile and paste', async () => {
      // Copy the molecule.
      await nmrium.page.click(
        '_react=MoleculePanelHeader >> _react=MenuButton',
      );
      await nmrium.page.click('text=Copy as molfile');
      // Paste the molecule.
      await nmrium.page.click(
        '_react=ToolTip[title="Paste molfile"] >> button',
      );
      await expect(nmrium.page.locator('text=2 / 2')).toBeVisible();
      await expect(
        nmrium.page.locator('text=C11H14N2O - 190.25 >> nth=1'),
      ).toBeVisible();
      await expect(nmrium.page.locator('text=C11H14N2O - 190.25')).toHaveCount(
        2,
      );
      await expect(
        nmrium.page.locator('.mol-svg-container #molSVG1'),
      ).toBeVisible();
    });
  }
  await test.step('Empty panel', async () => {
    if (browserName === 'chromium') {
      await expect(nmrium.page.locator('text=2 / 2')).toBeVisible();
      await expect(
        nmrium.page.locator('text=C11H14N2O - 190.25 >> nth=1'),
      ).toBeVisible();

      // Delete molecule.
      await nmrium.page.click(
        '_react=ToolTip[title="Delete Molecule"] >> button',
      );
    }
    // Check selected molecule.
    await expect(nmrium.page.locator('text=1 / 1')).toBeVisible();
    await expect(nmrium.page.locator('text=C11H14N2O - 190.25')).toBeVisible();

    // Delete molecule.
    await nmrium.page.click(
      '_react=ToolTip[title="Delete Molecule"] >> button',
    );

    // The SVG container should not be rendered when there are no molecules.
    await expect(nmrium.page.locator('.mol-svg-container ')).toBeHidden();
  });
});
