import { ElementHandle } from 'playwright';

import NmriumPage from '../NmriumPage';
import { selectRange } from '../utilities/selectRange';

async function addRange(
  nmrium: NmriumPage,
  containerElemment: ElementHandle<SVGElement | HTMLElement>,
  startX,
  endX,
  childIndex,
) {
  await selectRange(nmrium, containerElemment, {
    axis: 'X',
    startX,
    endX,
  });
  await nmrium.page.isVisible(
    `:nth-match([data-test-id="range"],${childIndex})`,
  );
}

async function resizeRange(nmrium: NmriumPage) {
  const rightResizer = await nmrium.page.waitForSelector(
    ':nth-match([data-test-id="range"] .handle,1)',
  );

  const { x, height } = (await rightResizer.boundingBox()) as BoundingBox;

  await nmrium.page.mouse.move(x, height / 2, { steps: 15 });

  await nmrium.page.mouse.down({ button: 'left' });

  await nmrium.page.mouse.move(x + 20, height / 2, {
    steps: 15,
  });
  await nmrium.page.mouse.up();

  const greenArea = await nmrium.page.waitForSelector(
    ':nth-match([data-test-id="range"],1) rect',
  );

  const { width } = (await greenArea.boundingBox()) as BoundingBox;

  expect(width).toBe(30);
}

async function deleteRange(nmrium: NmriumPage) {
  const rightResizer = await nmrium.page.waitForSelector(
    ':nth-match([data-test-id="range"],2)',
  );

  const { x, height, width } =
    (await rightResizer.boundingBox()) as BoundingBox;
  await nmrium.page.mouse.move(x + width / 2, height / 2, { steps: 15 });
  await nmrium.page.keyboard.press('Backspace');
  expect(await nmrium.page.$$('data-test-id=range')).toHaveLength(1);
}

test('Should ranges Add/resize/delete', async () => {
  const nmrium = await NmriumPage.create();
  await nmrium.open1D();

  const containerElemment = await nmrium.waitForViewer();

  //select range tool
  await nmrium.page.click('data-test-id=tool-rangesPicking');

  //add two ranges
  await addRange(nmrium, containerElemment, 50, 60, 1);
  await addRange(nmrium, containerElemment, 110, 120, 2);

  //test resize the first range
  await resizeRange(nmrium);

  // test delete the second range
  await deleteRange(nmrium);
});

test('Automatic ranges detection should work', async () => {
  const nmrium = await NmriumPage.create();
  await nmrium.open1D();

  await nmrium.waitForViewer();

  //select range tool
  await nmrium.page.click('data-test-id=tool-rangesPicking');

  //apply auto ranges detection
  await nmrium.page.click('data-test-id=auto-ranges-detection-btn');

  expect(
    (await nmrium.page.$$('data-test-id=range')).length,
  ).toBeGreaterThanOrEqual(10);
});
