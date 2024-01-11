import { Color2D, SpectrumTwoDimensionsColor } from 'nmr-load-save';

import { UsedColors } from '../../../types/UsedColors';
import { generate2DColor } from '../../utilities/generateColor';
import { getCustomColor } from '../../utilities/getCustomColor';

interface GetTwoDimensionsColorOption {
  usedColors?: UsedColors;
  colors?: SpectrumTwoDimensionsColor[];
  regenerate?: boolean;
}

export function get2DColor(
  spectrum,
  options: GetTwoDimensionsColorOption,
): Color2D {
  const { regenerate = false, usedColors = {}, colors } = options;

  let color: Partial<Color2D> = {};
  if (
    spectrum?.display?.negativeColor === undefined ||
    spectrum?.display?.positiveColor === undefined ||
    regenerate
  ) {
    const customColor = getCustomColor(spectrum, colors);
    if (customColor) {
      color = customColor;
    } else {
      color = generate2DColor(
        spectrum.info.experiment,
        usedColors?.['2d'] || [],
      );
    }
  } else {
    const { positiveColor = 'red', negativeColor = 'blue' } =
      spectrum?.display || {};
    color = { positiveColor, negativeColor };
  }
  if (usedColors['2d']) {
    usedColors['2d'].push(color.positiveColor);
  }

  return color as Color2D;
}
