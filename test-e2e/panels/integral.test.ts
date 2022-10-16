import { test, expect } from '@playwright/test';

import NmriumPage from '../NmriumPage';
import { createPeakInRange } from '../utilities/selectRange';

async function addIntegral(
  nmrium: NmriumPage,
  startX: number,
  endX: number,
  childIndex: number,
) {
  await createPeakInRange(nmrium, {
    axis: 'X',
    startX,
    endX,
  });

  // Should have integral with at least 1000 points
  const path = (await nmrium.page.getAttribute(
    `_react=Integral >> nth=${childIndex} >> path`,
    'd',
  )) as string;
  expect(path.length).toBeGreaterThan(1000);
  expect(path).not.toContain('NaN');
}

async function resizeIntegral(nmrium: NmriumPage) {
  const rightResizer = nmrium.page.locator(
    '_react=Integral >> nth=0 >> _react=SVGResizerHandle >> nth=1',
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

  const path = (await nmrium.page.getAttribute(
    '_react=Integral >> nth=0 >> path',
    'd',
  )) as string;

  expect(path.length).toBeGreaterThan(1000);
  expect(path).not.toContain('NaN');

  const container = nmrium.page.locator(
    '_react=Integral >> nth=0 >> rect >> nth=0',
  );
  const { width } = (await container.boundingBox()) as BoundingBox;
  expect(width).toBe(41);
}

async function deleteIntegral(nmrium: NmriumPage) {
  const container = nmrium.page.locator('_react=Integral >> nth=0 ');
  await container.hover();
  await nmrium.page.keyboard.press('Delete');
  await expect(nmrium.page.locator('_react=Integral')).toHaveCount(1);
}

test('Should Integrals Add/resize/delete', async ({ page }) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open1D();
  await nmrium.clickTool('integral');

  await test.step('Add integrals ', async () => {
    // Test add two integrals
    await addIntegral(nmrium, 50, 70, 0);
    await addIntegral(nmrium, 110, 130, 1);
  });

  await test.step('Resize one of the integrals ', async () => {
    // Test resize the first integral
    await resizeIntegral(nmrium);
  });

  await test.step('Delete one of the integrals ', async () => {
    // Test delete the first integral
    await deleteIntegral(nmrium);
  });
});
