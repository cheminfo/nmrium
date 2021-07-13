import NmriumPage from '../NmriumPage';
import { selectRange } from '../utilities/selectRange';

test('Should Add Integral', async () => {
  const nmrium = await NmriumPage.create();
  await nmrium.open1D();

  const containerElemment = await nmrium.page.waitForSelector('.Pane1');

  //select integral tool
  await nmrium.page.click('[data-test-id="tool-integral"]');

  await selectRange(nmrium, containerElemment, {
    axis: 'X',
    startX: 50,
    endX: 70,
  });

  //should have integral with at least 1000 point
  const path = (await nmrium.page.getAttribute(
    ':nth-match([data-test-id="integral-path"],1)',
    'd',
  )) as string;
  expect(path.length).toBeGreaterThan(1000);
  expect(path).not.toContain('NaN');
});
