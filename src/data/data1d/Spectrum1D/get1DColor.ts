import { SpectrumOneDimensionColor } from 'nmr-load-save';

import { UsedColors } from '../../../types/UsedColors.js';
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

export const COLORS: readonly string[] = [
  '#C10020',
  '#007D34',
  '#803E75',
  '#FF6800',
  '#B32851',
  '#7F180D',
  '#232C16',
  '#A6BDD7',
  '#CEA262',
  '#817066',
  '#FF8E00',
  '#F6768E',
  '#00538A',
  '#FF7A5C',
  '#53377A',
  '#FFB300',
  '#F4C800',
  '#93AA00',
  '#593315',
  '#F13A13',
] as const;

export function get1DColor(
  spectrum,
  options: ColorOptions | RandomColorOptions,
) {
  const { regenerate = false, usedColors = {}, colors } = options;
  let color = 'black';

  if (!spectrum?.display?.color || regenerate) {
    const customColor = getCustomColor(spectrum, colors);
    const isRandom = isRandomColorGeneration(options) && options.random;

    if (customColor && !isRandom) {
      color = customColor;
    } else {
      color = generateColor({ usedColors: usedColors?.['1d'] || [] });
    }
  } else {
    color = spectrum.display.color;
  }

  if (usedColors['1d']) {
    usedColors['1d'].push(color);
  }

  return { color };
}
