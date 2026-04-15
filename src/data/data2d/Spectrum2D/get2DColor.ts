import type {
  Color2D,
  SpectrumTwoDimensionsColor,
} from '@zakodium/nmrium-core';

import type { UsedColors } from '../../../types/UsedColors.js';
import { adjustAlpha, generateColor } from '../../utilities/generateColor.js';
import { getCustomColor } from '../../utilities/getCustomColor.js';

interface BaseColorOptions {
  usedColors?: UsedColors;
  colors?: SpectrumTwoDimensionsColor[];
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

export function get2DColor(
  spectrum: any,
  options: ColorOptions | RandomColorOptions,
): Color2D {
  let color: Partial<Color2D>;
  if (
    spectrum?.display?.negativeColor === undefined ||
    spectrum?.display?.positiveColor === undefined ||
    options.regenerate
  ) {
    const isRandom = isRandomColorGeneration(options) && options.random;
    const customColor =
      getCustomColor(spectrum, options.colors) ||
      ((color2D as any)?.[spectrum.info.experiment] ?? null);

    if (customColor && !isRandom) {
      color = customColor;
    } else {
      const positiveColor = generateColor({
        usedColors: options.usedColors?.['2d'] || [],
      });
      const negativeColor = adjustAlpha(positiveColor, 50);
      color = { positiveColor, negativeColor };
    }
  } else {
    const { positiveColor = 'red', negativeColor = 'blue' } =
      spectrum?.display || {};
    color = { positiveColor, negativeColor };
  }
  if (options.usedColors?.['2d'] && color.positiveColor) {
    options.usedColors['2d'].push(color.positiveColor);
  }

  return {
    positiveColor: color.positiveColor ?? '',
    negativeColor: color.negativeColor ?? '',
  };
}

type ExperimentType = 'cosy' | 'roesy' | 'noesy' | 'tocsy' | 'hsqc' | 'hmbc';

export const color2D: Readonly<Record<ExperimentType, Color2D>> = {
  cosy: { positiveColor: 'darkblue', negativeColor: 'blue' },
  roesy: { positiveColor: 'deeppink', negativeColor: 'yellow' },
  noesy: { positiveColor: 'deeppink', negativeColor: 'yellow' },
  tocsy: { positiveColor: 'green', negativeColor: 'yellow' },
  hsqc: { positiveColor: 'black', negativeColor: 'yellow' },
  hmbc: { positiveColor: 'darkviolet', negativeColor: 'yellow' },
};
