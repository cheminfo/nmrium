import { BrowserContext, Page } from 'playwright';

declare global {
  /* eslint-disable no-var */
  var nmriumBrowser: BrowserContext;
  var nmriumPages: Page[];
}
