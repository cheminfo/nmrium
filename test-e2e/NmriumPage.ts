import { readFileSync } from 'fs';

import { Locator, Page, expect } from '@playwright/test';

export default class NmriumPage {
  public readonly page: Page;
  public readonly viewerLocator: Locator;

  public constructor(page: Page) {
    this.page = page;
    this.viewerLocator = page.locator('data-test-id=viewer');
  }

  public static async create(page: Page): Promise<NmriumPage> {
    await page.goto('http://localhost:3000/#/');
    return new NmriumPage(page);
  }

  public async open1D() {
    await this.page.click('li >> text=General');
    await this.page.click('li >> text=1H spectrum test');
  }

  public async open2D() {
    await this.page.click('li >> text=General');
    await this.page.click('li >> text=2D cosy');
  }

  public async clickPanel(title: string) {
    await this.page.click(`_react=AccordionItem[title="${title}"]`);
  }

  public async clickTool(id: string) {
    await this.page.click(`_react=ToolbarItem[id="${id}"]`);
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
      // input debounce for 250ms
      await this.page.waitForTimeout(250);
    }
    if (mode === 'automatic') {
      const select = this.page.locator('select');
      await select.selectOption('automatic');
    }
    if (mode === 'absolute') {
      const select = this.page.locator('select');
      await select.selectOption('absolute');
    }
    await this.page.click('button >> text=Apply');
    await expect(
      this.page.locator('_react=FilterPanel >> text=Phase correction'),
    ).toBeVisible();
  }
  public async checkSVGLength(length: number) {
    const svgLength = await this.viewerLocator.evaluate(
      (node) => node.innerHTML.length,
    );
    expect(svgLength).toBeGreaterThan(length * 0.8);
    expect(svgLength).toBeLessThan(length * 1.2);
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
}
