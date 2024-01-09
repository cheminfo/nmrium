import lodashGet from 'lodash/get';
import { Spectrum1D, SpectrumOneDimensionColor } from 'nmr-load-save';

import { UsedColors } from '../../../types/UsedColors';
import { generateColor } from '../../utilities/generateColor';

interface GetOnDimensionColorOption {
  usedColors?: UsedColors;
  colors?: SpectrumOneDimensionColor[];
  regenerate?: boolean;
}

function getColor(spectrum: Spectrum1D, colors?: SpectrumOneDimensionColor[]) {
  if (!colors || colors.length === 0) return null;

  let color: string | null = null;
  for (const item of colors) {
    const spectrumValue = lodashGet(spectrum, item.jpath);
    if (spectrumValue && spectrumValue === item.value) {
      color = item.color;
      break;
    }
  }

  return color;
}

export function get1DColor(spectrum, options: GetOnDimensionColorOption) {
  const { regenerate = false, usedColors = {}, colors } = options;
  let color = 'black';

  if (!spectrum?.display?.color || regenerate) {
    const customColor = getColor(spectrum, colors);

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
