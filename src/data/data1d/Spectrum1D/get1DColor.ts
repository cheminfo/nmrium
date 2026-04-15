import type { SpectrumOneDimensionColor } from '@zakodium/nmrium-core';

import type { UsedColors } from '../../../types/UsedColors.js';
import { generateColor } from '../../utilities/generateColor.js';
import { getCustomColor } from '../../utilities/getCustomColor.js';

interface BaseColorOptions {
  usedColors?: UsedColors;
  colors?: SpectrumOneDimensionColor[];
}

interface ColorOptions extends BaseColorOptions {
  regenerate?: false;
}
interface RandomColorOptions extends BaseColorOptions {
  regenerate: true;
  random?: boolean;
}

function isRandomColorGeneration(
  options: ColorOptions | RandomColorOptions,
): options is RandomColorOptions {
  return 'random' in options;
}

export function get1DColor(
  spectrum: any,
  options: ColorOptions | RandomColorOptions,
) {
  let color: string;

  if (!spectrum?.display?.color || options.regenerate) {
    const customColor = getCustomColor(spectrum, options.colors);
    const isRandom = isRandomColorGeneration(options) && options.random;

    if (customColor && !isRandom) {
      color = customColor;
    } else {
      color = generateColor({ usedColors: options.usedColors?.['1d'] || [] });
    }
  } else {
    color = spectrum.display.color;
  }

  if (options.usedColors?.['1d']) {
    options.usedColors['1d'].push(color);
  }

  return { color };
}
