import { test, expect } from '@playwright/test';

import NmriumPage from '../NmriumPage';
import { createPeakInRange } from '../utilities/selectRange';

async function addRange(
  nmrium: NmriumPage,
  startX: number,
  endX: number,
  count: number,
) {
  await createPeakInRange(nmrium, {
    axis: 'X',
    startX,
    endX,
  });
  await expect(nmrium.page.locator(`data-test-id=range`)).toHaveCount(count);
}

async function resizeRange(nmrium: NmriumPage) {
  const rightResizer = nmrium.page.locator(
    'data-test-id=range >> nth=0 >> _react=SVGResizerHandle >> nth=1',
  );

  const {
    x,
    height,
    width: DragElementWidth,
  } = (await rightResizer.boundingBox()) as BoundingBox;

  await nmrium.page.mouse.move(x + DragElementWidth / 2, height / 2, {
    steps: 15,
  });

  await nmrium.page.mouse.down({ button: 'left' });

  await nmrium.page.mouse.move(x + DragElementWidth / 2 + 20, height / 2, {
    steps: 15,
  });
  await nmrium.page.mouse.up();

  const greenArea = nmrium.page.locator(
    'data-test-id=range >> nth=0 >> rect >> nth=0',
  );

  const { width } = (await greenArea.boundingBox()) as BoundingBox;

  expect(width).toBe(31);
}

async function deleteRange(nmrium: NmriumPage) {
  const rightResizer = nmrium.page.locator('data-test-id=range').nth(1);

  const { x, height, width } =
    (await rightResizer.boundingBox()) as BoundingBox;
  await nmrium.page.mouse.move(x + width / 2, height / 2, { steps: 15 });
  await nmrium.page.keyboard.press('Delete');
  await expect(nmrium.page.locator('data-test-id=range')).toHaveCount(1);
}

test('Should ranges Add/resize/delete', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open1D();

  //select range tool
  await nmrium.clickTool('ranges-pick');

  //add two ranges
  await addRange(nmrium, 50, 60, 1);
  await addRange(nmrium, 110, 120, 2);

  //test resize the first range
  await resizeRange(nmrium);

  // test delete the second range
  await deleteRange(nmrium);
});

test('Automatic ranges detection should work', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open1D();

  //select range tool
  await nmrium.clickTool('ranges-pick');

  //apply auto ranges detection
  await nmrium.page.click('text=Auto ranges picking');

  expect(
    await nmrium.page.locator('data-test-id=range').count(),
  ).toBeGreaterThanOrEqual(10);
});
