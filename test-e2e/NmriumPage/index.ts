import { readFileSync } from 'node:fs';

import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { NmriumPageViewer } from './NmriumPageViewer.js';

type ClickOptions = Parameters<Page['click']>[1];

interface ToolLocatorOptions {
  prefixSelectors?: string[];
  active?: boolean;
  caseSensitive?: boolean;
}

export default class NmriumPage {
  public readonly page: Page;
  public readonly viewer: NmriumPageViewer;

  public constructor(page: Page) {
    this.page = page;
    this.viewer = new NmriumPageViewer(page);
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
    const { prefixSelectors = [], active, caseSensitive = false } = options;
    const selectors: string[] = [
      `_react=ToolbarItem[tooltip="${title}" ${caseSensitive ? '' : 'i'}]`,
    ];
    const parentsSelectors: string[] = [''];
    for (const s of prefixSelectors.reverse()) {
      parentsSelectors.unshift(s);
    }

    if (active !== undefined) {
      selectors.push(`[active=${active}]`);
    }
    return this.page.locator(
      `${parentsSelectors.join(' >> ') + selectors.join('')} >> nth=0`,
    );
  }

  public async assertXScaleDomain(min: number, max: number) {
    const xTicks = this.page.locator('.x >> .tick');
    const firstTick = xTicks.first();
    const lastTick = xTicks.last();
    await expect(firstTick).toHaveText(min.toString());
    await expect(lastTick).toHaveText(max.toString());
  }

  public async getNumberOfDistinctColors() {
    const Lines = this.page.getByTestId('spectrum-line').locator('_react=Line');
    // get all lines from locator
    const lines = await Lines.all();
    // get all colors from lines
    const colors = await Promise.all(
      lines.map(async (line) => {
        const color = await line.getAttribute('stroke');
        return color;
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
    const filename: string[] = [];

    if (typeof file === 'string') {
      filename.push(file);
    } else {
      filename.push(...file);
    }

    const bufferData = filename.map((f) => {
      const data = `data:application/octet-stream;base64,${readFileSync(
        `test-e2e/data/${f}`,
      ).toString('base64')}`;
      return data;
    });

    const dataTransfer = await this.page.evaluateHandle(
      async ({ bufferData, filename }) => {
        const dt = new DataTransfer();

        await Promise.all(
          bufferData.map(async (buffer, i) => {
            const blobData = await fetch(buffer).then((res) => res.blob());
            const file = new File([blobData], filename[i]);
            dt.items.add(file);
          }),
        );

        return dt;
      },
      {
        bufferData,
        filename,
      },
    );

    await this.page.dispatchEvent('_react=DropZone', 'drop', {
      dataTransfer,
    });
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
