import NmriumPage from '../NmriumPage';

test('should display the empty component', async () => {
  const nmrium = await NmriumPage.create();
  expect(await nmrium.page.title()).toBe('NMRium');
});
