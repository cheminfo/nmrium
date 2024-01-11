import { SpectrumOneDimensionColor } from 'nmr-load-save';

import { UsedColors } from '../../../types/UsedColors';
import { generateColor } from '../../utilities/generateColor';
import { getCustomColor } from '../../utilities/getCustomColor';

interface GetOnDimensionColorOption {
  usedColors?: UsedColors;
  colors?: SpectrumOneDimensionColor[];
  regenerate?: boolean;
}

export function get1DColor(spectrum, options: GetOnDimensionColorOption) {
  const { regenerate = false, usedColors = {}, colors } = options;
  let color = 'black';

  if (!spectrum?.display?.color || regenerate) {
    const customColor = getCustomColor(spectrum, colors);

    if (customColor) {
      color = customColor;
    } else {
      color = generateColor(false, usedColors?.['1d'] || []);
    }
  } else {
    color = spectrum.display.color;
  }

  if (usedColors['1d']) {
    usedColors['1d'].push(color);
  }

  return { color };
}
