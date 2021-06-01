import NmriumPage from '../NmriumPage';

test('Check if the color picker is visible after click on the color-indicator', async () => {
  const nmrium = await NmriumPage.create();
  await nmrium.open2D();

  expect(await nmrium.page.isVisible('.sketch-picker')).toBe(false);
  await nmrium.page.click(':nth-match([data-test-id="color-indicator"], 2)');
  expect(await nmrium.page.isVisible('.sketch-picker')).toBe(true);
});
