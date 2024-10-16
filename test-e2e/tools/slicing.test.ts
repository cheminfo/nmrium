import { expect, test } from '@playwright/test';

import NmriumPage from '../NmriumPage/index.js';

test('Slicing too should show 1d (horizontal and vertical) traces', async ({
  page,
}) => {
  const nmrium = await NmriumPage.create(page);
  await nmrium.open2D();

  await nmrium.clickTool('slicing');

  await nmrium.viewer.moveMouse({ x: 200, y: 200 });

  const horizontalPath = (await nmrium.page.getAttribute(
    `_react=HorizontalSliceChart >> path >> nth=0`,
    'd',
  )) as string;
  expect(horizontalPath.length).toBeGreaterThan(1000);
  expect(horizontalPath).not.toContain('NaN');

  const verticalPath = (await nmrium.page.getAttribute(
    `_react=VerticalSliceChart >> path >> nth=0`,
    'd',
  )) as string;
  expect(verticalPath.length).toBeGreaterThan(1000);
  expect(verticalPath).not.toContain('NaN');
});
