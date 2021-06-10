import { Page } from 'playwright';

export default class NmriumPage {
  public page: Page;

  public constructor(page: Page) {
    this.page = page;
  }

  public static async create(): Promise<NmriumPage> {
    const page = await globalThis.nmriumMainContext.newPage();
    await page.goto('http://localhost:3000/#/');
    globalThis.nmriumPages.push(page);
    return new NmriumPage(page);
  }

  public async open1D() {
    await this.page.click('text=General');
    await this.page.click('text=1H spectrum test');
  }

  public async open2D() {
    await this.page.click('text=General');
    await this.page.click('text=2D cosy');
  }

  public async clickPanel(title: string) {
    await this.page.click(`data-test-id=panel-title-${title}`);
  }
}
