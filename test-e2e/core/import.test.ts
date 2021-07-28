import NmriumPage from '../NmriumPage';

test('should load and migrate .nmrium data from version 0 to version 1', async () => {
  const nmrium = await NmriumPage.create();
  await nmrium.waitForViewer();

  const [fileChooser] = await Promise.all([
    nmrium.page.waitForEvent('filechooser'),
    await nmrium.page.click('data-test-id=import'),
    await nmrium.page.click('data-test-id=importFile'),
  ]);
  await fileChooser.setFiles('../test-e2e/data/1h-version-0.nmrium');

  await nmrium.page.click('data-test-id=tab-1H,1H');
});
