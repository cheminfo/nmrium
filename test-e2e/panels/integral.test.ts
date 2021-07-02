import NmriumPage from '../NmriumPage';

test('Should Add Integral', async () => {
  const nmrium = await NmriumPage.create();
  await nmrium.open1D();
  const containerElemment = await nmrium.page.waitForSelector('.Pane1');

  //select integral tool
  await nmrium.page.click('[data-test-id="tool-integral"]');

  // get the bounding box {x,y,width,hegith} for the drawing area
  const boundingBox = await containerElemment?.boundingBox();

  // check if the returned bounding box is not null
  if (boundingBox) {
    const cursorStartX = boundingBox.x + boundingBox.width / 2;
    const cursorStartY = boundingBox.y + boundingBox.height / 2;
    //move the custose to the center of the draw area
    await nmrium.page.mouse.move(cursorStartX, cursorStartY, { steps: 15 });
    // press shift + left mouse down
    await nmrium.page.keyboard.down('Shift');
    await nmrium.page.mouse.down({ button: 'left' });

    //move the cusrose to new postion and still hold shift and left mouse button
    await nmrium.page.mouse.move(cursorStartX + 100, cursorStartY, {
      steps: 15,
    });

    //release shift and left mouse button
    await nmrium.page.keyboard.up('Shift');
    await nmrium.page.mouse.up({ button: 'left' });

    //should have integral with at least 1000 point
    await nmrium.page.waitForSelector('g.integrals');
    const path = (await nmrium.page.getAttribute(
      'g.integrals path',
      'd',
    )) as string;
    expect(path.length).toBeGreaterThan(1000);
    expect(path).not.toContain('NaN');
  }
});
