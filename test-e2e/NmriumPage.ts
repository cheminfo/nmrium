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
}
