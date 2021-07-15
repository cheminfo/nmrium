import { ElementHandle } from 'playwright';

import NmriumPage from '../NmriumPage';

interface Options {
  clickCount?: number | undefined;
  delay?: number | undefined;
  button?: 'left' | 'right' | 'middle' | undefined;
  keyboardKey?: string | undefined;
}

export async function mouseClick(
  nmrium: NmriumPage,
  element: ElementHandle<SVGElement | HTMLElement>,
  x: number,
  y: number,
  options?: Options,
) {
  const boundingBox = (await element?.boundingBox()) as BoundingBox;
  const { keyboardKey = '', ...clickOptions } = options || {
    keyboardKey: '',
  };

  if (keyboardKey) {
    await nmrium.page.keyboard.down(keyboardKey);
  }
  await nmrium.page.mouse.move(boundingBox.x + x, boundingBox.y + y, {
    steps: 15,
  });
  await nmrium.page.mouse.click(
    boundingBox.x + x,
    boundingBox.y + y,
    clickOptions,
  );
  if (keyboardKey) {
    await nmrium.page.keyboard.up(keyboardKey);
  }
}
