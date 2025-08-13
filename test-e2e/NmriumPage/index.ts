import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { NmriumPageMoleculeEditor } from './NmriumPageMoleculeEditor.js';
import { NmriumPageViewer } from './NmriumPageViewer.js';

type ClickOptions = Parameters<Page['click']>[1];

interface ToolLocatorOptions {
  active?: boolean;
  caseSensitive?: boolean;
}

export default class NmriumPage {
  public readonly page: Page;
  public readonly viewer: NmriumPageViewer;
  public readonly moleculeEditor: NmriumPageMoleculeEditor;

  public constructor(page: Page) {
    this.page = page;
    this.viewer = new NmriumPageViewer(page);
    this.moleculeEditor = new NmriumPageMoleculeEditor(page);
  }

  public static async create(page: Page): Promise<NmriumPage> {
    await page.goto('http://localhost:3000/#/');
    return new NmriumPage(page);
  }

  public async open1D() {
    await this.page.click('li >> text=Cytisine');
    await this.page.click('li >> text=1H spectrum');
  }

  public async open2D() {
    await this.page.click('li >> text=Simple spectra');
    await this.page.click('li >> text=COSY ethylbenzene');
  }

  public async clickPanel(title: string, options: ClickOptions = {}) {
    await this.page.click(`_react=AccordionItem[title="${title}"]`, {
      position: { x: 10, y: 10 },
      ...options,
    });
  }

  public async clickTool(id: string) {
    await this.page
      .locator(`_react=ToolbarItem[id="${id}"] >> nth=0`)
      .or(this.page.locator(`_react=ToolbarPopoverItem[id="${id}"] >> nth=0`))
      .click();
  }
  public async clickToolByTitle(title: string) {
    await this.page.click(`_react=ToolbarItem[tooltip="${title}"] >> nth=0`);
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
    const xTicks = this.page.locator('_react=XAxis1D >> _react=Tickets');
    const firstTick = xTicks.first();
    const lastTick = xTicks.last();
    await expect(firstTick).toHaveText(min.toString());
    await expect(lastTick).toHaveText(max.toString());
  }

  public async getNumberOfDistinctColors() {
    const linesLocator = this.page
      .getByTestId('spectrum-line')
      .locator('_react=Line');
    // Get all lines from the locator.
    const lines = await linesLocator.all();
    // Get all colours from lines.
    const colors = await Promise.all(
      lines.map(async (line) => {
        return line.getAttribute('stroke');
      }),
    );
    // remove duplicates
    const distinctColors = [...new Set(colors)];
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
      modifiers: ['Shift'],
    });
    const pivotIndicatorLocator = this.viewer.locator.locator(
      '_react=PivotIndicator1D >> _react=Indicator[x=100]',
    );
    await expect(pivotIndicatorLocator).toBeVisible();

    const selectLocator = this.page
      .locator('_react=SimplePhaseCorrectionOptionsPanel')
      .getByRole('combobox');
    if (mode === 'automatic') {
      await selectLocator.click();
      await this.page.getByRole('option', { name: 'automatic' }).click();
    }
    if (mode === 'absolute') {
      await selectLocator.click();
      await this.page
        .getByRole('option', { name: 'Convert to absolute spectrum' })
        .click();
    }
    await this.page.click('_react=Header >> button >> text=Apply', {
      delay: 200,
    });

    await expect(
      this.page.locator('_react=FiltersSectionsPanel >> text=Phase correction'),
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
      .locator('_react=DropZone >> input[type=file]')
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
    const alert = this.page.locator('_react=ToasterProvider', {
      hasText: text,
    });
    await alert.locator('button').click();
  }

  async changePanelStatus(
    panelTitle: string,
    status: 'hidden' | 'active' | 'available',
  ) {
    const selectLocator = this.page.locator(
      `td:has-text("${panelTitle}")  + td`,
    );
    await selectLocator.click();
    await this.page.getByRole('option', { name: status }).click();
  }
}
