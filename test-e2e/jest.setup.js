const playwright = require('playwright');

const browserName = process.env.BROWSER || 'chromium';
const browserType = playwright[browserName];

beforeAll(async () => {
  // Create a browser instance for all tests.
  globalThis.nmriumBrowser = await browserType.launch({
    // slowMo: 500
  });
  // Create a default context.
  globalThis.nmriumMainContext = await globalThis.nmriumBrowser.newContext({
    // recordVideo: {
    //   dir: 'videos/',
    // },
  });
});
afterAll(async () => {
  // Close the default context.
  await globalThis.nmriumMainContext.close();
  // Close the browser instance.
  await globalThis.nmriumBrowser.close();
});
beforeEach(async () => {
  // Pages created automatically are added here so they can be closed at the end of the test.
  globalThis.nmriumPages = [];
});
afterEach(async () => {
  // Close all automatically-created pages.
  await Promise.all(globalThis.nmriumPages.map((page) => page.close()));
});
