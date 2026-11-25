import type { Locator } from '@playwright/test';
import { expect, test } from '@playwright/test';

import NmriumPage from '../NmriumPage/index.js';

async function checkMoleculeStructureIsExists(
  nmrium: NmriumPage,
  index: number,
) {
  const slide = nmrium.getPanel('structuresPanel').getByRole('group', {
    name: new RegExp(String.raw`^${index + 1} of \d+$`),
  });
  const locator = slide.getByRole('img');
  await expect(locator).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
  await expect(locator).toBeVisible();
}

/**
 * Get a button of the molecules pager in the chemical structures panel.
 * @param nmrium - The NMRium page.
 * @param name - The name of the button.
 */
function getMoleculesPagerButton(
  nmrium: NmriumPage,
  name: 'Previous' | 'Next',
) {
  return nmrium
    .getPanel('structuresPanel')
    .getByRole('button', { name, exact: true });
}

/**
 * Get the molecules floating over the spectrum.
 * @param nmrium - The NMRium page.
 */
function getFloatingMolecules(nmrium: NmriumPage) {
  return nmrium.page.getByRole('figure');
}

test('should draw structure and display it with MF', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);

  const structuresPanel = nmrium.getPanel('structuresPanel');

  // Open the "Structures" panel.
  await nmrium.clickPanel('structuresPanel');

  await test.step('empty panel', async () => {
    // The SVG container should not be rendered when there are no molecules.
    await expect(nmrium.page.locator('.mol-svg-container ')).toBeHidden();
  });

  await test.step('Add ring molecule', async () => {
    // Click on the "Add Molecule" button.
    await nmrium
      .getPanelToolbarButton('structuresPanel', 'Add molecule')
      .click();

    // Select the aromatic ring tool.
    await nmrium.moleculeEditor.clickTool('aromaticRing');
    // Draw the ring.
    await nmrium.moleculeEditor.clickDrawArea({ x: 50, y: 50 });

    // Save the molecule.
    await nmrium.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Save' })
      .click();

    await nmrium.page.getByRole('dialog').waitFor({ state: 'hidden' });
  });

  await test.step('Check the visibly of the benzene molecule', async () => {
    // The molecule SVG rendering should now be visible in the panel.
    await checkMoleculeStructureIsExists(nmrium, 0);

    // The molecular formula should now be visible in the panel.
    await expect(structuresPanel.getByText('C6H6 - 78.11')).toBeVisible();

    // The number of molecules should now be visible in the panel.
    await expect(
      structuresPanel.getByText('[ 1 / 1 ]', { exact: true }),
    ).toBeVisible();
  });

  await test.step('Add a second molecule and check the visibility', async () => {
    // Click on the "Add Molecule" button.
    await nmrium
      .getPanelToolbarButton('structuresPanel', 'Add molecule')
      .click();

    // Select the hexane tool.
    await nmrium.moleculeEditor.clickTool('hexane');
    // Draw the ring.
    await nmrium.moleculeEditor.clickDrawArea({ x: 50, y: 50 });

    // Save the molecule.
    await nmrium.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Save' })
      .click();
    await nmrium.page.getByRole('dialog').waitFor({ state: 'hidden' });

    // Check the visibility.

    // The molecule SVG rendering should now be visible in the panel.
    await checkMoleculeStructureIsExists(nmrium, 1);

    // The molecular formula should now be visible in the panel.
    await expect(structuresPanel.getByText('C6H12 - 84.16')).toBeVisible();

    // The number of molecules should now be visible in the panel.
    await expect(structuresPanel.getByText('2 / 2')).toBeVisible();
  });

  await test.step('Switch between molecules', async () => {
    // Start with the second molecule.
    await expect(structuresPanel.getByText('2 / 2')).toBeVisible();
    await expect(structuresPanel.getByText('C6H12 - 84.16')).toBeVisible();

    // Go to the previous molecule.
    await getMoleculesPagerButton(nmrium, 'Previous').click();

    // Check selected molecule number.
    await expect(structuresPanel.getByText('1 / 2')).toBeVisible();

    // Check selected molecule formula.
    await expect(structuresPanel.getByText('C6H6 - 78.11')).toBeVisible();

    // Go to the next molecule.
    await getMoleculesPagerButton(nmrium, 'Next').click();
    // Check selected molecule number.
    await expect(structuresPanel.getByText('2 / 2')).toBeVisible();

    // Check selected molecule formula.
    await expect(structuresPanel.getByText('C6H12 - 84.16')).toBeVisible();
  });
});

test('molecules 1H spectrum', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open1D();

  const structuresPanel = nmrium.getPanel('structuresPanel');
  const floatMoleculeButton = nmrium.getPanelToolbarButton(
    'structuresPanel',
    'Float molecule',
  );

  await test.step('open Chemical structures panel', async () => {
    await nmrium.clickPanel('structuresPanel');
  });

  await test.step('check existing molecule', async () => {
    // The molecule SVG rendering should now be visible in the panel.
    await checkMoleculeStructureIsExists(nmrium, 0);

    // Check the existing molecular formula.
    await expect(structuresPanel.getByText('C11H14N2O - 190.25')).toBeVisible();

    // Check the existing number of molecules.
    await expect(structuresPanel.getByText('[ 1 / 1 ]')).toBeVisible();
  });

  await test.step('Add benzene molecule and check the visibility', async () => {
    // Click on the "Add Molecule" button.
    await nmrium
      .getPanelToolbarButton('structuresPanel', 'Add molecule')
      .click();

    // Select the aromatic ring tool.
    await nmrium.moleculeEditor.clickTool('aromaticRing');
    // Draw the benzene.
    await nmrium.moleculeEditor.clickDrawArea({
      x: 50,
      y: 50,
    });

    // Save the molecule.
    await nmrium.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Save', exact: true })
      .click();
    await nmrium.page.getByRole('dialog').waitFor({ state: 'hidden' });

    // Check the visibility.

    // The molecule SVG rendering should now be visible in the panel.
    await checkMoleculeStructureIsExists(nmrium, 1);

    // Check the molecular formula.
    await expect(structuresPanel.getByText('C6H6 - 78.11')).toBeVisible();

    // Check the number of molecules.
    await expect(structuresPanel.getByText('[ 2 / 2 ]')).toBeVisible();
  });

  await test.step('Add a third molecule and check the visibility', async () => {
    // Click on the "Add Molecule" button.
    await nmrium
      .getPanelToolbarButton('structuresPanel', 'Add molecule')
      .click();

    // Select the hexane tool.
    await nmrium.moleculeEditor.clickTool('hexane');
    // Draw the ring.
    await nmrium.moleculeEditor.clickDrawArea({
      x: 50,
      y: 50,
    });

    // Save the molecule.
    await nmrium.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Save' })
      .click();
    await nmrium.page.getByRole('dialog').waitFor({ state: 'hidden' });

    // Check the visibility.

    // The molecule SVG rendering should now be visible in the panel.
    await checkMoleculeStructureIsExists(nmrium, 2);
    // Check the molecular formula.
    await expect(structuresPanel.getByText('C6H12 - 84.16')).toBeVisible();

    // Check the number of molecules.
    await expect(structuresPanel.getByText('[ 3 / 3 ]')).toBeVisible();
  });

  await test.step('Switch between molecules', async () => {
    // Start with the third molecule.
    await expect(structuresPanel.getByText('[ 3 / 3 ]')).toBeVisible();
    await expect(structuresPanel.getByText('C6H12 - 84.16')).toBeVisible();

    // Go to the previous molecule.
    await getMoleculesPagerButton(nmrium, 'Previous').click();

    // Check selected molecule number.
    await expect(structuresPanel.getByText('[ 2 / 3 ]')).toBeVisible();

    // Check selected molecule formula.
    await expect(structuresPanel.getByText('C6H6 - 78.11')).toBeVisible();

    // Go to the previous molecule.
    await getMoleculesPagerButton(nmrium, 'Previous').click();

    // Check selected molecule number.
    await expect(structuresPanel.getByText('[ 1 / 3 ]')).toBeVisible();
    // Check selected molecule formula.
    await expect(structuresPanel.getByText('C11H14N2O - 190.25')).toBeVisible();
    await expect(getMoleculesPagerButton(nmrium, 'Previous')).toBeHidden();

    // Go to the next molecule.
    await getMoleculesPagerButton(nmrium, 'Next').click();
    // Check selected molecule number.
    await expect(structuresPanel.getByText('[ 2 / 3 ]')).toBeVisible();

    // Check selected molecule formula.
    await expect(structuresPanel.getByText('C6H6 - 78.11')).toBeVisible();

    // Go to the next molecule.
    await getMoleculesPagerButton(nmrium, 'Next').click();

    // Check the third molecule.
    await expect(structuresPanel.getByText('[ 3 / 3 ]')).toBeVisible();
    await expect(structuresPanel.getByText('C6H12 - 84.16')).toBeVisible();
    await expect(getMoleculesPagerButton(nmrium, 'Next')).toBeHidden();

    // Go to the previous molecule.
    await getMoleculesPagerButton(nmrium, 'Previous').click();

    // Check selected molecule number.
    await expect(structuresPanel.getByText('[ 2 / 3 ]')).toBeVisible();
    // Check selected molecule formula.
    await expect(structuresPanel.getByText('C6H6 - 78.11')).toBeVisible();
  });

  await test.step('Check molecules in integrals', async () => {
    const dialog = nmrium.page.getByRole('dialog');
    await nmrium.showPanel('integralsPanel');
    await nmrium
      .getPanel('integralsPanel')
      .getByRole('toolbar')
      .getByRole('button', { name: 'Change integration sum' })
      .click();
    await expect(dialog.locator('#molSVG0')).toBeVisible();
    await expect(dialog.getByText('C11H14N2O - 190.25')).toBeVisible();
    await expect(dialog.getByText('New sum for H will be 14!')).toBeVisible();
    await dialog.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(dialog.locator('#molSVG1')).toBeVisible();
    await expect(dialog.getByText('C6H6 - 78.11')).toBeVisible();
    await expect(dialog.getByText('New sum for H will be 6!')).toBeVisible();
    await dialog.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(dialog.locator('#molSVG2')).toBeVisible();
    await expect(dialog.getByText('C6H12 - 84.16')).toBeVisible();
    await expect(dialog.getByText('New sum for H will be 12!')).toBeVisible();
    await dialog.getByRole('button', { name: 'Close' }).click();
  });

  await test.step('Check molecules in ranges', async () => {
    const dialog = nmrium.page.getByRole('dialog');
    await nmrium
      .getPanel('rangesPanel')
      .getByRole('button', { name: 'Change ranges sum' })
      .click();
    await expect(dialog.locator('#molSVG0')).toBeVisible();
    await expect(dialog.getByText('C11H14N2O - 190.25')).toBeVisible();
    await expect(dialog.getByText('New sum for H will be 14!')).toBeVisible();
    await dialog.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(dialog.locator('#molSVG1')).toBeVisible();
    await expect(dialog.getByText('C6H6 - 78.11')).toBeVisible();
    await expect(dialog.getByText('New sum for H will be 6!')).toBeVisible();
    await dialog.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(dialog.locator('#molSVG2')).toBeVisible();
    await expect(dialog.getByText('C6H12 - 84.16')).toBeVisible();
    await expect(dialog.getByText('New sum for H will be 12!')).toBeVisible();
    await dialog.getByRole('button', { name: 'Close' }).click();
  });

  await test.step('Check float molecule', async () => {
    // Check float molecule btn is on.
    await expect(floatMoleculeButton).toHaveAttribute('aria-pressed', 'true');
    // Click on float molecule button to hide it.
    await nmrium
      .getPanelToolbarButton('structuresPanel', 'Float molecule')
      .click();
    // Check floated molecule.
    await expect(getFloatingMolecules(nmrium).first()).toBeVisible();
    // Check float molecule btn is off.
    await expect(floatMoleculeButton).toHaveAttribute('aria-pressed', 'false');
  });

  await test.step('Close float molecule', async () => {
    // Close float molecule draggable structure.
    const structureLocator = getFloatingMolecules(nmrium);
    await structureLocator.hover();
    await nmrium.page.getByRole('button', { name: 'Hide molecule' }).click();
    // Check floated molecule.
    await expect(getFloatingMolecules(nmrium).first()).toBeHidden();
    await expect(structureLocator).toBeHidden();
    // Check float molecule btn is off.
    await expect(floatMoleculeButton).toHaveAttribute('aria-pressed', 'false');
    // Click on float molecule button.
    await nmrium
      .getPanelToolbarButton('structuresPanel', 'Float molecule')
      .click();
    // Check floated molecule.
    await expect(getFloatingMolecules(nmrium).first()).toBeVisible();
    // Check float molecule btn is on.
    await expect(floatMoleculeButton).toHaveAttribute('aria-pressed', 'true');
  });

  await test.step('Check copy as molfile V3 or V2 and paste', async () => {
    await clickExportMenuOption(nmrium, 'Copy as molfile V3');
    await nmrium.page.getByTestId('paste-molecule-action').click();
    await clickExportMenuOption(nmrium, 'Copy as molfile V2');
    await nmrium.page.getByTestId('paste-molecule-action').click();

    await expect(
      structuresPanel.getByText('[ 5 / 5 ]', { exact: true }),
    ).toBeVisible();
    await expect(structuresPanel.getByText('C6H6 - 78.11')).toHaveCount(3);
    await checkMoleculeStructureIsExists(nmrium, 3);
  });

  await test.step('Delete the copy', async () => {
    // Delete molecule.
    await structuresPanel
      .getByRole('button', { name: 'Delete molecule', exact: true })
      .click();
    // Check deleted molecule.
    await expect(structuresPanel.getByText('C6H6 - 78.11')).toHaveCount(2);
    // Check floated molecule.
    await expect(getFloatingMolecules(nmrium).first()).toBeVisible();
    // Go to the next molecule.
    await getMoleculesPagerButton(nmrium, 'Next').click();
  });

  await test.step('Check delete float molecule', async () => {
    // Delete molecule.
    await nmrium
      .getPanelToolbarButton('structuresPanel', 'Delete molecule')
      .click();
    // Check deleted Floated molecule.
    await expect(getFloatingMolecules(nmrium)).toHaveCount(1);
    // Check selected molecule.
    await expect(
      structuresPanel.getByText('[ 1 / 3 ]', { exact: true }),
    ).toBeVisible();

    await expect(structuresPanel.getByText('C11H14N2O - 190.25')).toBeVisible();
    await checkMoleculeStructureIsExists(nmrium, 0);
  });

  await test.step('Delete molecule', async () => {
    // Go to the next molecule.
    await getMoleculesPagerButton(nmrium, 'Next').click();
    // Check the second molecule.
    await expect(
      structuresPanel.getByText('[ 2 / 3 ]', { exact: true }),
    ).toBeVisible();

    await expect(structuresPanel.getByText('C6H12 - 84.16')).toBeVisible();
    await checkMoleculeStructureIsExists(nmrium, 1);

    // Delete molecule.
    await nmrium
      .getPanelToolbarButton('structuresPanel', 'Delete molecule')
      .click();

    // Check selected molecule.
    await expect(
      structuresPanel.getByText('[ 1 / 2 ]', { exact: true }),
    ).toBeVisible();

    await expect(structuresPanel.getByText('C11H14N2O - 190.25')).toBeVisible();
    await checkMoleculeStructureIsExists(nmrium, 0);
  });

  await test.step('Empty panel', async () => {
    // Check selected molecule.
    await expect(
      structuresPanel.getByText('[ 1 / 2 ]', { exact: true }),
    ).toBeVisible();

    await expect(structuresPanel.getByText('C11H14N2O - 190.25')).toBeVisible();

    // Delete both remaining molecules.
    await nmrium
      .getPanelToolbarButton('structuresPanel', 'Delete molecule')
      .click();
    await nmrium
      .getPanelToolbarButton('structuresPanel', 'Delete molecule')
      .click();

    // The SVG container should not be rendered when there are no molecules.
    await expect(nmrium.page.locator('.mol-svg-container ')).toBeHidden();
  });
});

async function getCount(locator: Locator): Promise<number> {
  const text = await locator.textContent();
  if (!text) throw new Error('no text content');
  return Number(text.slice(0, 1));
}

test('check callbacks count on changing structures', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  const structuresPanel = nmrium.getPanel('structuresPanel');
  const dataCount = nmrium.page.getByTestId('data-count');
  const viewCount = nmrium.page.getByTestId('view-count');
  await test.step('open test page', async () => {
    await nmrium.openDemo('Props debug', 'Callback - 1H spectrum cytisine');
    // wait the spectrum to load
    await expect(nmrium.page.getByTestId('spectrum-line')).toBeVisible();

    await expect(dataCount).toContainText('0');
    await expect(viewCount).toContainText(/[2-5]/);
  });

  const initialDataCount = await getCount(dataCount);
  const initialViewCount = await getCount(viewCount);

  await test.step('Check the visibly of molecule', async () => {
    // Open the "Structures" panel.
    await nmrium.clickPanel('structuresPanel');
    // The molecule SVG rendering should now be visible in the panel.
    await checkMoleculeStructureIsExists(nmrium, 0);

    // The molecular formula should now be visible in the panel.
    await expect(structuresPanel.getByText('C11H14N2O - 190.25')).toBeVisible();

    // The number of molecules should now be visible in the panel.
    await expect(
      structuresPanel.getByText('[ 1 / 1 ]', { exact: true }),
    ).toBeVisible();
  });

  await test.step('Add a second molecule and check the visibility', async () => {
    // Click on the "Add Molecule" button.
    await nmrium
      .getPanelToolbarButton('structuresPanel', 'Add molecule')
      .click();

    // Select the hexane tool.
    await nmrium.moleculeEditor.clickTool('hexane');
    // Draw the ring.
    await nmrium.moleculeEditor.clickDrawArea({
      x: 50,
      y: 50,
    });

    // Save the molecule.
    await nmrium.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Save', exact: true })
      .click();

    await expect(dataCount).toContainText(String(initialDataCount + 1));
    await expect(viewCount).toContainText(String(initialViewCount + 1));
    // Check the visibility.

    // The molecule SVG rendering should now be visible in the panel.
    await checkMoleculeStructureIsExists(nmrium, 1);

    // The molecular formula should now be visible in the panel.
    await expect(
      nmrium.getPanel('structuresPanel').getByText('C6H12 - 84.16'),
    ).toBeVisible();

    // The number of molecules should now be visible in the panel.
    await expect(
      structuresPanel.getByText('[ 2 / 2 ]', { exact: true }),
    ).toBeVisible();
  });

  await test.step('Check float molecule', async () => {
    // Check float molecule btn is on.
    await expect(
      nmrium.getPanelToolbarButton('structuresPanel', 'Float molecule', {
        pressed: true,
      }),
    ).toBeVisible();
    // Check floated molecule.
    await expect(getFloatingMolecules(nmrium).first()).toBeVisible();

    await expect(dataCount).toContainText(String(initialDataCount + 1));
    await expect(viewCount).toContainText(String(initialViewCount + 1));
  });

  await test.step('change float position molecule', async () => {
    const structureLocator = getFloatingMolecules(nmrium);
    await structureLocator.hover();
    await nmrium.page
      .getByRole('button', { name: 'Move molecule' })
      .dragTo(
        nmrium.page
          .getByRole('group', { name: 'Horizontal axis' })
          .getByTestId('axis-primary-tick-label')
          .nth(1),
        { force: true },
      );
    await expect(dataCount).toContainText(String(initialDataCount + 1));
    await expect(viewCount).toContainText(String(initialViewCount + 2));
  });
});

async function clickExportMenuOption(nmrium: NmriumPage, option: string) {
  await nmrium
    .getPanel('structuresPanel')
    .locator('#molecule-export-as')
    .click();
  await nmrium.page.getByRole('menuitem', { name: option }).click();
}
