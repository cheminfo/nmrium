import { ElementHandle } from 'playwright';

import NmriumPage from '../NmriumPage';
import { selectRange } from '../utilities/selectRange';

async function addIntegral(
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

  //should have integral with at least 1000 point
  const path = (await nmrium.page.getAttribute(
    `:nth-match([data-test-id="integral"] path,${childIndex})`,
    'd',
  )) as string;
  expect(path.length).toBeGreaterThan(1000);
  expect(path).not.toContain('NaN');
}

async function resizeIntegral(nmrium: NmriumPage) {
  const rightResizer = await nmrium.page.waitForSelector(
    ':nth-match([data-test-id="integral"] .handle,1)',
  );

  const { x, height } = (await rightResizer.boundingBox()) as BoundingBox;

  await nmrium.page.mouse.move(x, height / 2, { steps: 15 });

  await nmrium.page.mouse.down({ button: 'left' });

  await nmrium.page.mouse.move(x + 20, height / 2, {
    steps: 15,
  });
  await nmrium.page.mouse.up();

  const path = (await nmrium.page.getAttribute(
    ':nth-match([data-test-id="integral"] path,1)',
    'd',
  )) as string;

  expect(path.length).toBeGreaterThan(1000);
  expect(path).not.toContain('NaN');

  const container = await nmrium.page.waitForSelector(
    ':nth-match([data-test-id="integral"],1) rect',
  );
  const { width } = (await container.boundingBox()) as BoundingBox;

  expect(width).toBe(40);
}

async function deleteIntegral(nmrium: NmriumPage) {
  const rightResizer = await nmrium.page.waitForSelector(
    ':nth-match([data-test-id="integral"],1)',
  );

  const { x, height, width } =
    (await rightResizer.boundingBox()) as BoundingBox;
  await nmrium.page.mouse.move(x + width / 2, height / 2, { steps: 15 });
  await nmrium.page.keyboard.press('Backspace');
  expect(await nmrium.page.$$('data-test-id=integral')).toHaveLength(1);
}

test('Should Integrals Add/resize/delete', async () => {
  const nmrium = await NmriumPage.create();
  await nmrium.open1D();

  const containerElemment = await nmrium.waitForViewer();

  // select integral tool
  await nmrium.page.click('data-test-id=tool-integral');

  // test add two inetgrals
  await addIntegral(nmrium, containerElemment, 50, 70, 1);
  await addIntegral(nmrium, containerElemment, 110, 130, 2);

  // test resize the first integral
  await resizeIntegral(nmrium);

  // test delete the first integral
  await deleteIntegral(nmrium);
});
