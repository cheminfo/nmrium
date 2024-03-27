import { Color2D, SpectrumTwoDimensionsColor } from 'nmr-load-save';

import { UsedColors } from '../../../types/UsedColors';
import { adjustAlpha, generateColor } from '../../utilities/generateColor';
import { getCustomColor } from '../../utilities/getCustomColor';

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
  spectrum,
  options: ColorOptions | RandomColorOptions,
): Color2D {
  const { regenerate = false, usedColors = {}, colors } = options;

  let color: Partial<Color2D> = {};
  if (
    spectrum?.display?.negativeColor === undefined ||
    spectrum?.display?.positiveColor === undefined ||
    regenerate
  ) {
    const isRandom = isRandomColorGeneration(options) && options.random;
    const customColor =
      getCustomColor(spectrum, colors) || color2D?.[spectrum.info.experiment];

    if (customColor && !isRandom) {
      color = customColor;
    } else {
      const positiveColor = generateColor({
        usedColors: usedColors?.['2d'] || [],
      });
      const negativeColor = adjustAlpha(positiveColor, 50);
      color = { positiveColor, negativeColor };
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

type ExperimentType = 'cosy' | 'roesy' | 'noesy' | 'tocsy' | 'hsqc' | 'hmbc';

export const color2D: Readonly<Record<ExperimentType, Color2D>> = {
  cosy: { positiveColor: 'darkblue', negativeColor: 'blue' },
  roesy: { positiveColor: 'pink', negativeColor: 'yellow' },
  noesy: { positiveColor: 'pink', negativeColor: 'yellow' },
  tocsy: { positiveColor: 'green', negativeColor: 'yellow' },
  hsqc: { positiveColor: 'black', negativeColor: 'yellow' },
  hmbc: { positiveColor: 'darkviolet', negativeColor: 'yellow' },
};
