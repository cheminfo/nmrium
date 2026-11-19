import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { Mandatory } from '@zakodium/utils';

import { NmriumPageMoleculeEditor } from './NmriumPageMoleculeEditor.js';
import { NmriumPageViewer } from './NmriumPageViewer.js';

type ClickOptions = Parameters<Page['click']>[1];
type GetByRoleOptions = Mandatory<Parameters<Locator['getByRole']>[1]>;

interface ToolLocatorOptions {
  active?: boolean;
  caseSensitive?: boolean;
}

export default class NmriumPage {
  public static async create(page: Page): Promise<NmriumPage> {
    await page.goto('http://localhost:3000/#/');
    return new NmriumPage(page);
  }

  public readonly page: Page;
  public readonly viewer: NmriumPageViewer;
  public readonly moleculeEditor: NmriumPageMoleculeEditor;

  public constructor(page: Page) {
    this.page = page;
    this.viewer = new NmriumPageViewer(page);
    this.moleculeEditor = new NmriumPageMoleculeEditor(page);
  }

  /**
   * Open a demo from the sidebar.
   * @param category - The category of the demo.
   * @param name - The name of the demo.
   */
  public async openDemo(category: string, name: string) {
    await this.page
      .getByRole('menuitem', { name: category })
      .getByText(category, { exact: true })
      .click();
    await this.page.getByRole('menuitem', { name, exact: true }).click();
  }

  /**
   * Open the "Cytisine - 1H spectrum" demo.
   */
  public async open1D() {
    await this.openDemo('Cytisine', '1H spectrum');
  }

  /**
   * Open the "Simple spectra - COSY ethylbenzene" demo.
   */
  public async open2D() {
    await this.openDemo('Simple spectra', 'COSY ethylbenzene');
  }

  /**
   * Click on a panel header to expand or collapse it.
   * @param title - The panel title, as shown in its header.
   * @param options
   */
  public async clickPanel(title: string, options: ClickOptions = {}) {
    await this.getPanelButton(title).click(options);
  }

  /**
   * Get the header button of an accordion panel, which expands or collapses it.
   * @param title - The panel title, as shown in its header.
   */
  public getPanelButton(title: string) {
    return this.page
      .getByRole('button', { name: title, exact: true, expanded: true })
      .or(
        this.page.getByRole('button', {
          name: title,
          exact: true,
          expanded: false,
        }),
      );
  }

  /**
   * Get the content of an accordion panel.
   * @param title - The panel title, as shown in its header.
   */
  public getPanel(title: string) {
    return this.page.getByRole('region', { name: title, exact: true });
  }

  /**
   * Get all the tabs of the spectra panel.
   */
  public getSpectraTabs() {
    return this.getPanel('Spectra').getByRole('tab');
  }

  /**
   * Get a tab of the spectra panel.
   * @param nucleus - The nucleus or nuclei of the tab (for example "1H" or "1H,13C").
   */
  public getSpectraTab(nucleus: string) {
    return this.getPanel('Spectra').getByRole('tab', {
      name: nucleus,
      exact: true,
    });
  }

  /**
   * Get the options of the selected tool, displayed in the header.
   */
  public getToolOptions() {
    return this.page.getByRole('group', { name: 'Tool options', exact: true });
  }

  /**
   * Get the spectra table of the active tab in the spectra panel.
   */
  public getSpectraTable() {
    return this.getPanel('Spectra').getByRole('table');
  }

  /**
   * Get the list of filters applied to the active spectrum, in the processing panel.
   */
  public getFiltersList() {
    return this.getPanel('Processing').getByRole('list', { name: 'Filters' });
  }

  /**
   * Show a panel hidden from the accordion by clicking its panels bar icon.
   * @param name - The panel name, as shown in the icon tooltip.
   */
  public async showPanel(name: string) {
    await this.page
      .getByRole('toolbar', { name: 'Panels bar', exact: true })
      .getByRole('button', { name, exact: true, pressed: false })
      .click();
  }

  public getPanelToolbarButton(
    panelName: string,
    buttonName: string,
    options: Omit<GetByRoleOptions, 'name'> = {},
  ) {
    const { exact = true, ...restOptions } = options;
    return this.getPanel(panelName).getByRole('button', {
      name: buttonName,
      exact,
      ...restOptions,
    });
  }

  public async clickTool(id: string) {
    await this.page
      .locator(`_react=ToolbarItem[id="${id}"] >> nth=0`)
      .or(this.page.locator(`_react=ToolbarPopoverItem[id="${id}"] >> nth=0`))
      .click();
  }

  public async clickToolByTitle(title: string) {
    await this.page.getByRole('button', { name: title, exact: true }).click();
  }

  public getToolbarLocatorByTitle(
    title: string,
    options: ToolLocatorOptions = {},
  ) {
    const { active, caseSensitive = false } = options;
    const selectors: string[] = [
      `_react=ToolbarItem[tooltip="${title}" ${caseSensitive ? '' : 'i'}]`,
    ];

    if (active !== undefined) {
      selectors.push(`[active=${active}]`);
    }
    return this.page.locator(`${selectors.join('')} >> nth=0`);
  }

  public async assertOneDimensionXScaleDomain(min: number, max: number) {
    const xTickLabels = this.page
      .getByRole('group', { name: 'Horizontal axis', exact: true })
      .getByTestId('axis-primary-tick-label');

    const firstTick = xTickLabels.first();
    const lastTick = xTickLabels.last();
    await expect(firstTick).toHaveText(min.toString());
    await expect(lastTick).toHaveText(max.toString());
  }

  public async getNumberOfDistinctColors() {
    const linesLocator = this.page.getByTestId('spectrum-line');
    // Get all lines from the locator.
    const lines = await linesLocator.all();
    // Get all colours from lines.
    const colors = await Promise.all(
      lines.map(async (line) => {
        return line.getAttribute('stroke');
      }),
    );
    // remove duplicates
    const distinctColors = Array.from(new Set(colors));
    return distinctColors.length;
  }

  public async applyPhaseCorrection(
    options: {
      keyboard?: boolean;
      mode?: 'automatic' | 'manual' | 'absolute';
    } = {},
  ) {
    const { keyboard = false, mode = 'manual' } = options;

    if (keyboard) {
      await this.viewer.moveMouse();
      await this.page.keyboard.press('KeyA');
    } else {
      await this.clickTool('phaseCorrection');
    }
    if (mode === 'manual') {
      await this.page.fill('input[name="ph1"]', '100');
      await this.page
        .locator('input[name="ph1"].debounce-end')
        .waitFor({ state: 'visible' });
      await this.page.fill('input[name="ph0"]', '-28');
      await this.page
        .locator('input[name="ph0"].debounce-end')
        .waitFor({ state: 'visible' });
    }

    //check change the pivot point for 1D
    await this.viewer.locator.click({
      position: { x: 100, y: 200 },
    });
    const pivotIndicatorLocator =
      this.viewer.locator.getByTestId('pivot-indicator');
    await expect(pivotIndicatorLocator).toBeVisible();

    const toolOptions = this.getToolOptions();
    const selectLocator = toolOptions.getByRole('combobox', {
      name: 'Phase correction mode',
      exact: true,
    });
    if (mode === 'automatic') {
      await selectLocator.click();
      await this.page.getByRole('option', { name: 'automatic' }).click();
    } else if (mode === 'absolute') {
      await selectLocator.click();
      await this.page
        .getByRole('option', { name: 'Convert to absolute spectrum' })
        .click();
    }
    await toolOptions
      .getByRole('button', { name: 'Apply', exact: true })
      .click({ delay: 200 });

    await expect(
      this.getFiltersList().getByText('Phase correction'),
    ).toBeVisible();
  }

  public async dropFile(file: string | string[]) {
    const filenames: string[] = [];

    if (typeof file === 'string') {
      filenames.push(file);
    } else {
      filenames.push(...file);
    }

    await this.page
      .getByLabel('Import files', { exact: true })
      .setInputFiles(filenames.map((f) => `test-e2e/data/${f}`));
  }

  async saveWorkspaceModal(name: string) {
    // Save changes.
    await this.page.click('div[role="dialog"] >> text=Apply and Save');

    // Enter a name for the workspace.
    await this.page.locator('input[name="workspaceName"]').fill(name);

    // Save the user workspace.
    await this.page.click(
      'div[role="dialog"] >> button:has-text("Save workspace")',
    );
    await this.dismissAlert('Preferences saved');
  }

  async dismissAlert(text: string) {
    // The toast message has the alert role, and the close button is its sibling.
    const toast = this.page
      .getByRole('alert')
      .filter({ hasText: text })
      .locator('..');
    await toast.getByRole('button', { name: 'Close', exact: true }).click();
  }

  async changePanelStatus(
    panelTitle: string,
    status: 'hidden' | 'active' | 'available',
  ) {
    const selectLocator = this.page
      .getByRole('dialog')
      .getByRole('tabpanel')
      .getByLabel(panelTitle);
    await selectLocator.click();
    await this.page.getByRole('option', { name: status }).click();
  }
}
