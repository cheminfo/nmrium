import NmriumPage from '../NmriumPage';

test('should draw structure and display it with MF', async () => {
  const nmrium = await NmriumPage.create();
  // Open the "Structures" panel.
  await nmrium.clickPanel('Structures');

  // The SVG container should not be rendered when there are no molecules.
  expect(await nmrium.page.isVisible('.mol-svg-container')).toBe(false);

  // Click on the "Add Molecule" button.
  await nmrium.page.click('data-test-id=panel-structures-button-add');
  // Select the "aromatic ring" tool.
  await nmrium.page.click('canvas', {
    position: {
      x: 35,
      y: 200,
    },
  });
  // Draw the aromatic ring.
  await nmrium.page.click('#drawarea1 canvas', {
    position: {
      x: 50,
      y: 50,
    },
  });
  // Save the molecule.
  await nmrium.page.click('text=Save');

  // The molecule SVG rendering should now be visible in the panel.
  expect(
    await nmrium.page.getAttribute('.mol-svg-container #molSVG0', 'xmlns'),
  ).toStrictEqual('http://www.w3.org/2000/svg');

  // The molecular formula should now be visible in the panel.
  expect(await nmrium.page.isVisible('text=C6H6 - 78.11')).toBe(true);

  // The number of molecules should now be visible in the panel.
  expect(await nmrium.page.isVisible('text=1 / 1')).toBe(true);
});
