import lodashGet from 'lodash/get';
import { Color2D, Spectrum2D, SpectrumTwoDimensionsColor } from 'nmr-load-save';

import { UsedColors } from '../../../types/UsedColors';
import { generate2DColor } from '../../utilities/generateColor';

function getColor(spectrum: Spectrum2D, colors?: SpectrumTwoDimensionsColor[]) {
  if (!colors || colors.length === 0) return null;

  let color: Color2D | null = null;
  for (const { jpath, value, negativeColor, positiveColor } of colors) {
    const spectrumValue = lodashGet(spectrum, jpath);
    if (spectrumValue && spectrumValue === value) {
      color = { negativeColor, positiveColor };
      break;
    }
  }

  return color;
}

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
    const customColor = getColor(spectrum, colors);
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
