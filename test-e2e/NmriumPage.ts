import { readFileSync } from 'node:fs';

import { Locator, Page, expect } from '@playwright/test';

type ClickOptions = Parameters<Page['click']>[1];

export default class NmriumPage {
  public readonly page: Page;
  public readonly viewerLocator: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.viewerLocator = page.getByTestId('viewer');
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
    await this.page.click(`_react=ToolbarItem[id="${id}"] >> nth=0`);
  }

  public async assertXScaleDomain(min: number, max: number) {
    const xTicks = this.page.locator('.x >> .tick');
    const firstTick = xTicks.first();
    const lastTick = xTicks.last();
    await expect(firstTick).toHaveText(min.toString());
    await expect(lastTick).toHaveText(max.toString());
  }

  public async moveMouseToViewer() {
    const { x, y, width, height } =
      (await this.viewerLocator.boundingBox()) as BoundingBox;
    await this.page.mouse.move(x + width / 2, y + height / 2);
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
      await this.moveMouseToViewer();
      await this.page.keyboard.press('KeyA');
    } else {
      await this.clickTool('phaseCorrection');
    }
    if (mode === 'manual') {
      await this.page.fill('input[name="ph1"]', '-100');
      await this.page.fill('input[name="ph0"]', '-104');
      await this.page.locator('input[name="ph0"]').blur();
    }
    if (mode === 'automatic') {
      const select = this.page.locator('select');
      await select.selectOption('automatic');
    }
    if (mode === 'absolute') {
      const select = this.page.locator('select');
      await select.selectOption('absolute');
    }
    await this.page.click('button >> text=Apply', { delay: 200 });

    await expect(
      this.page.locator('_react=FilterTable >> text=Phase correction'),
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
    await this.page.click('_react=Modal >> text=Apply and Save');

    // Enter a name for the workspace.
    await this.page.locator('input[name="workspaceName"]').fill(name);

    // Save the user workspace.
    await this.page
      .getByTestId('save-workspace-dialog')
      .locator('button')
      .locator('text=Save')
      .click();

    await this.dismissAlert('Preferences saved');
  }

  async dismissAlert(text: string) {
    const alert = this.page.locator('_react=AlertBlock', { hasText: text });
    await alert.locator('button').click();
  }
}
