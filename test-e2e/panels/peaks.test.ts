// import { ElementHandle } from 'playwright';

import NmriumPage from '../NmriumPage';
import { mouseClick } from '../utilities/mouseClick';
import { selectRange } from '../utilities/selectRange';

async function addPeaks(nmrium: NmriumPage) {
  const containerElement = await nmrium.waitForViewer();

  // select peak picking tool
  await nmrium.page.click('data-test-id=tool-peakPicking');

  // add peak by select range
  await selectRange(nmrium, containerElement, {
    axis: 'X',
    startX: 50,
    endX: 100,
  });

  await mouseClick(nmrium, containerElement, 200, 20, {
    keyboardKey: 'Shift',
  });

  await nmrium.page.waitForSelector(':nth-match([data-test-id="peak"],2)');

  expect(await nmrium.page.$$('data-test-id=peak')).toHaveLength(2);
}

async function shiftX(nmrium: NmriumPage) {
  //add peak by press left mouse button

  const peakInputElement = await nmrium.page.waitForSelector(
    ':nth-match([data-test-id="peak"],1) input',
  );

  const { x, width, y, height } =
    (await peakInputElement.boundingBox()) as BoundingBox;

  await nmrium.page.mouse.click(x + width / 2, y + height / 2);
  await peakInputElement.selectText();
  await peakInputElement.type('10');

  await nmrium.page.keyboard.press('Enter');

  const value = await nmrium.page.$eval(
    ':nth-match([data-test-id="peak"],1) input',
    (el: HTMLInputElement) => el.value,
  );

  expect(Number(value)).toBe(10);
}

async function deletePeak(nmrium: NmriumPage) {
  //add peak by press left mouse button
  const peakInputElement = await nmrium.page.waitForSelector(
    ':nth-match([data-test-id="peak"],2) input',
  );

  const { x, width, y, height } =
    (await peakInputElement.boundingBox()) as BoundingBox;

  await nmrium.page.mouse.move(x + width / 2, y + height / 2);

  await nmrium.page.keyboard.press('Backspace');

  // test that the peak deleted
  expect(await nmrium.page.$$('data-test-id=peak')).toHaveLength(1);
}

test('add/shift/delete peaks', async () => {
  const nmrium = await NmriumPage.create();
  await nmrium.open1D();

  await addPeaks(nmrium);
  await shiftX(nmrium);
  await deletePeak(nmrium);
});

test('Automatic peak picking should work', async () => {
  const nmrium = await NmriumPage.create();
  await nmrium.open1D();

  await nmrium.waitForViewer();

  //select range tool
  await nmrium.page.click('data-test-id=tool-peakPicking');

  //apply auto ranges detection
  await nmrium.page.click('data-test-id=auto-peak-picking-btn');

  expect(
    (await nmrium.page.$$('data-test-id=peak')).length,
  ).toBeGreaterThanOrEqual(10);
});
