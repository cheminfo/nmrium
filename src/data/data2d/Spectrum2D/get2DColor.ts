import { Color2D } from 'nmr-processing';

import { generate2DColor } from '../../utilities/generateColor';

export function get2DColor(options, usedColors, regenerate = false): Color2D {
  let color: Partial<Color2D> = {};
  if (
    options?.display?.negativeColor === undefined ||
    options?.display?.positiveColor === undefined ||
    regenerate
  ) {
    color = generate2DColor(options.info.experiment, usedColors['2d'] || []);
  } else {
    const { positiveColor = 'red', negativeColor = 'blue' } =
      options?.display || {};
    color = { positiveColor, negativeColor };
  }
  if (usedColors['2d']) {
    usedColors['2d'].push(color.positiveColor);
  }

  return color as Color2D;
}
