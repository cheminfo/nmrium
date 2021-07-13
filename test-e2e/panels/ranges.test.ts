import NmriumPage from '../NmriumPage';
import { selectRange } from '../utilities/selectRange';

test('Should Add Range Manually', async () => {
  const nmrium = await NmriumPage.create();
  await nmrium.open1D();

  const containerElemment = await nmrium.page.waitForSelector('.Pane1');

  //select integral tool
  await nmrium.page.click('[data-test-id="tool-rangesPicking"]');

  await selectRange(nmrium, containerElemment, {
    axis: 'X',
    startX: 50,
    endX: 60,
  });

  //should have integral with at least 1000 point
  await nmrium.page.isVisible(':nth-match([data-test-id="range"],1)');
});
