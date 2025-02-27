import type { Locator } from '@playwright/test';
import { expect, test } from '@playwright/test';

import NmriumPage from '../NmriumPage/index.js';

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
    await nmrium.clickToolByTitle('Add molecule');
    await nmrium.page
      .locator('div[role="dialog"]')
      .waitFor({ state: 'visible' });

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
    await nmrium.page.click('button >> text=Save');
  });

  await nmrium.page.locator('div[role="dialog"]').waitFor({ state: 'hidden' });

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
    await expect(
      nmrium.page.locator('_react=MoleculePanel >> text=1 / 1'),
    ).toBeVisible();
  });

  await test.step('Add a second molecule and check the visibility', async () => {
    // Click on the "Add Molecule" button.
    await nmrium.clickToolByTitle('Add molecule');
    await nmrium.page
      .locator('div[role="dialog"]')
      .waitFor({ state: 'visible' });

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
    await nmrium.page.click('button >> text=Save');
    await nmrium.page
      .locator('div[role="dialog"]')
      .waitFor({ state: 'hidden' });

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
    await expect(
      nmrium.page.locator('_react=MoleculePanel >> text=1 / 1'),
    ).toBeVisible();
  });
  await test.step('Add ring molecule and check the visibility', async () => {
    // Click on the "Add Molecule" button.
    await nmrium.clickToolByTitle('Add molecule');
    await nmrium.page
      .locator('div[role="dialog"]')
      .waitFor({ state: 'visible' });

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
    await nmrium.page.click('button >> text=Save');
    await nmrium.page
      .locator('div[role="dialog"]')
      .waitFor({ state: 'hidden' });

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
    await expect(
      nmrium.page.locator('_react=MoleculePanel >> text=2 / 2'),
    ).toBeVisible();
  });

  await test.step('Add a third molecule and check the visibility', async () => {
    // Click on the "Add Molecule" button.
    await nmrium.clickToolByTitle('Add molecule');
    await nmrium.page
      .locator('div[role="dialog"]')
      .waitFor({ state: 'visible' });
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
    await nmrium.page.click('button >> text=Save');
    await nmrium.page
      .locator('div[role="dialog"]')
      .waitFor({ state: 'hidden' });

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
    await expect(
      nmrium.page.locator('_react=MoleculePanel >> text=3 / 3'),
    ).toBeVisible();
  });
  await test.step('Switch between molecules', async () => {
    // Start with the third molecule.
    await expect(
      nmrium.page.locator('_react=MoleculePanel >> text=3 / 3'),
    ).toBeVisible();
    await expect(nmrium.page.locator('text=C6H12 - 84.16')).toBeVisible();

    // Go to the previous molecule.
    await nmrium.page.click('_react=Arrow[direction="left"]');

    // Check selected molecule number.
    await expect(
      nmrium.page.locator('_react=MoleculePanel >> text=2 / 3'),
    ).toBeVisible();

    // Check selected molecule formula.
    await expect(nmrium.page.locator('text=C6H6 - 78.11')).toBeVisible();

    // Go to the previous molecule.
    await nmrium.page.click('_react=Arrow[direction="left"]');

    // Check selected molecule number.
    await expect(
      nmrium.page.locator('_react=MoleculePanel >> text=1 / 3'),
    ).toBeVisible();
    // Check selected molecule formula.
    await expect(nmrium.page.locator('text=C11H14N2O - 190.25')).toBeVisible();
    await expect(
      nmrium.page.locator('_react=Arrow[direction="left"]'),
    ).toBeHidden();

    // Go to the next molecule.
    await nmrium.page.click('_react=Arrow[direction="right"]');
    // Check selected molecule number.
    await expect(
      nmrium.page.locator('_react=MoleculePanel >> text=2 / 3'),
    ).toBeVisible();

    // Check selected molecule formula.
    await expect(nmrium.page.locator('text=C6H6 - 78.11')).toBeVisible();

    // Go to the next molecule.
    await nmrium.page.click('_react=Arrow[direction="right"]');

    // Check the third molecule.
    await expect(
      nmrium.page.locator('_react=MoleculePanel >> text=3 / 3'),
    ).toBeVisible();
    await expect(nmrium.page.locator('text=C6H12 - 84.16')).toBeVisible();
    await expect(
      nmrium.page.locator('_react=Arrow[direction="right"]'),
    ).toBeHidden();

    // Go to the previous molecule.
    await nmrium.page.click('_react=Arrow[direction="left"]');

    // Check selected molecule number.
    await expect(
      nmrium.page.locator('_react=MoleculePanel >> text=2 / 3'),
    ).toBeVisible();
    // Check selected molecule formula.
    await expect(nmrium.page.locator('text=C6H6 - 78.11')).toBeVisible();
  });
  await test.step('Check molecules in integrals', async () => {
    await nmrium.clickPanel('Integrals');
    await nmrium.page.click(
      '_react=IntegralPanel >> _react=ToolbarItem[tooltip*="Change integration" i]',
    );
    await expect(
      nmrium.page.locator('div[role="dialog"] >> #molSVG0'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('div[role="dialog"] >> text=C11H14N2O - 190.25'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator(
        'div[role="dialog"] >> text=New sum for H will be 14!',
      ),
    ).toBeVisible();
    await nmrium.page.click(
      'div[role="dialog"] >> _react=Arrow[direction="right"]',
    );
    await expect(
      nmrium.page.locator('div[role="dialog"] >> #molSVG1'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('div[role="dialog"] >> text=C6H6 - 78.11'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator(
        'div[role="dialog"] >> text=New sum for H will be 6!',
      ),
    ).toBeVisible();
    await nmrium.page.click(
      'div[role="dialog"] >> _react=Arrow[direction="right"]',
    );
    await expect(
      nmrium.page.locator('div[role="dialog"] >> #molSVG2'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('div[role="dialog"] >> text=C6H12 - 84.16'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator(
        'div[role="dialog"] >> text=New sum for H will be 12!',
      ),
    ).toBeVisible();
    //TODO check why we have Button2 in development env and Button in production
    await nmrium.page.click(
      'div[role="dialog"] >> button:has(svg[data-icon="small-cross"])',
    );
  });
  await test.step('Check molecules in ranges', async () => {
    await nmrium.clickPanel('Ranges / Multiplet analysis');
    await nmrium.page.click(
      '_react=ToolbarItem[tooltip *= "Change ranges sum" i]',
    );
    await nmrium.page
      .locator('div[role="dialog"]')
      .waitFor({ state: 'visible' });
    await expect(
      nmrium.page.locator('div[role="dialog"] >> #molSVG0'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('div[role="dialog"] >> text=C11H14N2O - 190.25'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator(
        'div[role="dialog"] >> text=New sum for H will be 14!',
      ),
    ).toBeVisible();
    await nmrium.page.click(
      'div[role="dialog"] >> _react=Arrow[direction="right"]',
    );
    await expect(
      nmrium.page.locator('div[role="dialog"] >> #molSVG1'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('div[role="dialog"] >> text=C6H6 - 78.11'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator(
        'div[role="dialog"] >> text=New sum for H will be 6!',
      ),
    ).toBeVisible();
    await nmrium.page.click(
      'div[role="dialog"] >> _react=Arrow[direction="right"]',
    );
    await expect(
      nmrium.page.locator('div[role="dialog"] >> #molSVG2'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator('div[role="dialog"] >> text=C6H12 - 84.16'),
    ).toBeVisible();
    await expect(
      nmrium.page.locator(
        'div[role="dialog"] >> text=New sum for H will be 12!',
      ),
    ).toBeVisible();
    //TODO check why we have Button2 in development env and Button in production
    await nmrium.page.click(
      'div[role="dialog"] >> button:has(svg[data-icon="small-cross"])',
    );
  });
  await test.step('Check float molecule', async () => {
    // Check float molecule btn is off.
    await expect(
      nmrium.getToolbarLocatorByTitle('Float molecule', { active: true }),
    ).toBeHidden();
    // Click on float molecule button.
    await nmrium.clickToolByTitle('Float molecule');
    // Check floated molecule.
    await expect(nmrium.page.locator('#molSVG')).toBeVisible();
    // Check float molecule btn is on.
    await expect(
      nmrium.getToolbarLocatorByTitle('Float molecule', { active: true }),
    ).toBeVisible();
  });
  await test.step('Close float molecule', async () => {
    // Close float molecule draggable structure.
    const structureLocator = nmrium.page.locator('_react=DraggableStructure');
    await structureLocator.hover();
    await nmrium.page
      .locator('_react=ActionButton[tooltipProps.content *= "Hide molecule" i]')
      .click();
    // Check floated molecule.
    await expect(nmrium.page.locator('#molSVG')).toBeHidden();
    await expect(structureLocator).toBeHidden();
    // Check float molecule btn is off.
    await expect(
      nmrium.getToolbarLocatorByTitle('Float molecule', { active: true }),
    ).toBeHidden();
    // Click on float molecule button.
    await nmrium.clickToolByTitle('Float molecule');
    // Check floated molecule.
    await expect(nmrium.page.locator('#molSVG')).toBeVisible();
    // Check float molecule btn is on.
    await expect(
      nmrium.getToolbarLocatorByTitle('Float molecule', { active: true }),
    ).toBeVisible();
  });
  if (browserName !== 'webkit') {
    await test.step('Check copy as molfile V3 or V2 and paste', async () => {
      await clickExportMenuOption(nmrium, 'text=Copy as molfile V3');
      await nmrium.clickToolByTitle('Paste molfile');
      await clickExportMenuOption(nmrium, 'text=Copy as molfile V2');
      await nmrium.clickToolByTitle('Paste molfile');

      await expect(
        nmrium.page.locator('_react=MoleculePanel >> text=5 / 5'),
      ).toBeVisible();
      await expect(
        nmrium.page.locator('text=C6H6 - 78.11 >> nth=1'),
      ).toBeVisible();
      await expect(nmrium.page.locator('text=C6H6 - 78.11')).toHaveCount(3);
      await expect(
        nmrium.page.locator('.mol-svg-container #molSVG3'),
      ).toBeVisible();
    });
    await test.step('Delete the copy', async () => {
      // Delete molecule.
      await nmrium.page.click(
        '_react=ToolbarItem[tooltip="Delete molecule" i]',
      );
      // Check deleted molecule.
      await expect(nmrium.page.locator('text=C6H6 - 78.11')).toHaveCount(2);
      // Check floated molecule.
      await expect(nmrium.page.locator('#molSVG')).toBeVisible();
    });
    // Go to the next molecule.
    await nmrium.page.click('_react=Arrow[direction="right"]');
  }

  await test.step('Check delete float molecule', async () => {
    // Delete molecule.
    await nmrium.clickToolByTitle('Delete molecule');
    // Check deleted Floated molecule.
    await expect(nmrium.page.locator('#molSVG')).toBeHidden();
    // Check selected molecule.

    if (browserName !== 'webkit') {
      await expect(
        nmrium.page.locator('_react=MoleculePanel >> text=1 / 3'),
      ).toBeVisible();
    } else {
      await expect(
        nmrium.page.locator('_react=MoleculePanel >> text=1 / 2'),
      ).toBeVisible();
    }

    await expect(nmrium.page.locator('text=C11H14N2O - 190.25')).toBeVisible();
    await expect(
      nmrium.page.locator('.mol-svg-container #molSVG0'),
    ).toBeVisible();
  });

  await test.step('Delete molecule', async () => {
    // Go to the next molecule.
    await nmrium.page.click('_react=Arrow[direction="right"]');
    // Check the second molecule.

    if (browserName !== 'webkit') {
      await expect(
        nmrium.page.locator('_react=MoleculePanel >> text=2 / 3'),
      ).toBeVisible();
    } else {
      await expect(
        nmrium.page.locator('_react=MoleculePanel >> text=2 / 2'),
      ).toBeVisible();
    }

    await expect(nmrium.page.locator('text=C6H12 - 84.16')).toBeVisible();
    await expect(
      nmrium.page.locator('.mol-svg-container #molSVG1'),
    ).toBeVisible();

    // Delete molecule.
    await nmrium.clickToolByTitle('Delete molecule');

    // Check selected molecule.
    if (browserName !== 'webkit') {
      await expect(
        nmrium.page.locator('_react=MoleculePanel >> text=1 / 2'),
      ).toBeVisible();
    } else {
      await expect(
        nmrium.page.locator('_react=MoleculePanel >> text=1 / 1'),
      ).toBeVisible();
    }

    await expect(nmrium.page.locator('text=C11H14N2O - 190.25')).toBeVisible();
    await expect(
      nmrium.page.locator('.mol-svg-container #molSVG0'),
    ).toBeVisible();
  });

  await test.step('Empty panel', async () => {
    // Check selected molecule.

    if (browserName !== 'webkit') {
      await expect(
        nmrium.page.locator('_react=MoleculePanel >> text=1 / 2'),
      ).toBeVisible();
    } else {
      await expect(
        nmrium.page.locator('_react=MoleculePanel >> text=1 / 1'),
      ).toBeVisible();
    }

    await expect(nmrium.page.locator('text=C11H14N2O - 190.25')).toBeVisible();

    // Delete molecule.
    await nmrium.clickToolByTitle('Delete molecule');
    if (browserName !== 'webkit') {
      // Delete molecule.
      await nmrium.clickToolByTitle('Delete molecule');
    }

    // The SVG container should not be rendered when there are no molecules.
    await expect(nmrium.page.locator('.mol-svg-container ')).toBeHidden();
  });
});

async function getCount(locator: Locator): Promise<number> {
  const text = await locator.textContent();
  if (!text) throw new Error('no text content');
  return Number.parseInt(text.slice(0, 1), 10);
}

test('check callbacks count on changing structures', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  const dataCount = nmrium.page.getByTestId('data-count');
  const viewCount = nmrium.page.getByTestId('view-count');
  await test.step('open test page', async () => {
    await nmrium.page.click('li >> text=Props debug');
    await nmrium.page.click('li >> text=Callback - 1H spectrum cytisine');
    // wait the spectrum to load
    await expect(nmrium.page.getByTestId('spectrum-line')).toBeVisible();

    await expect(dataCount).toContainText(/[2-5]/);
    await expect(viewCount).toContainText(/[2-5]/);
  });

  const initialDataCount = await getCount(dataCount);
  const initialViewCount = await getCount(viewCount);

  await test.step('Check the visibly of molecule', async () => {
    // Open the "Structures" panel.
    await nmrium.clickPanel('Chemical structures');
    // The molecule SVG rendering should now be visible in the panel.
    await expect(
      nmrium.page.locator('.mol-svg-container #molSVG0'),
    ).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    await expect(
      nmrium.page.locator('.mol-svg-container #molSVG0'),
    ).toBeVisible();

    // The molecular formula should now be visible in the panel.
    await expect(nmrium.page.locator('text=C11H14N2O - 190.25')).toBeVisible();

    // The number of molecules should now be visible in the panel.
    await expect(
      nmrium.page.locator('_react=MoleculePanel >> text=1 / 1'),
    ).toBeVisible();
  });

  await test.step('Add a second molecule and check the visibility', async () => {
    // Click on the "Add Molecule" button.
    await nmrium.clickToolByTitle('Add molecule');

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
    await nmrium.page.click('button >> text=Save');

    await expect(dataCount).toContainText(String(initialDataCount + 1));
    await expect(viewCount).toContainText(String(initialViewCount));
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
    await expect(
      nmrium.page.locator('_react=MoleculePanel >> text=2 / 2'),
    ).toBeVisible();
  });
  await test.step('Check float molecule', async () => {
    // Check float molecule btn is off.
    await expect(
      nmrium.getToolbarLocatorByTitle('Float molecule', { active: true }),
    ).toBeHidden();
    // Click on float molecule button.
    await nmrium.clickToolByTitle('Float molecule');
    // Check floated molecule.
    await expect(nmrium.page.locator('#molSVG')).toBeVisible();
    // Check float molecule btn is on.
    await expect(
      nmrium.getToolbarLocatorByTitle('Float molecule', { active: true }),
    ).toBeVisible();

    await expect(dataCount).toContainText(String(initialDataCount + 1));
    await expect(viewCount).toContainText(String(initialViewCount + 1));
  });
  await test.step('change float position molecule', async () => {
    const structureLocator = nmrium.page.locator('_react=DraggableStructure');
    await structureLocator.hover();
    await nmrium.page
      .locator(
        '_react=ActionButton[tooltipProps.content *= "Move molecule" i] >> nth=0',
      )
      .dragTo(
        nmrium.page.locator('_react=XAxis1D >> _react=Tickets >> nth=1'),
        { force: true },
      );
    await expect(dataCount).toContainText(String(initialDataCount + 1));
    await expect(viewCount).toContainText(String(initialViewCount + 2));
  });
});

async function clickExportMenuOption(nmrium: NmriumPage, selector: string) {
  await nmrium.page.click(
    '_react=MoleculePanelHeader >> button[id="molecule-export-as"]',
  );
  await nmrium.page.click(selector);
}
