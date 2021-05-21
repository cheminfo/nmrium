import { Browser, BrowserContext, Page } from 'playwright';

declare global {
  /* eslint-disable no-var */
  var nmriumBrowser: Browser;
  var nmriumMainContext: BrowserContext;
  var nmriumPages: Page[];
}
