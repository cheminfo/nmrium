import lodashGet from 'lodash/get';
import {
  Color2D,
  Spectrum1D,
  Spectrum2D,
  SpectrumOneDimensionColor,
  SpectrumTwoDimensionsColor,
} from 'nmr-load-save';

type ReturnColor<ColorType> = ColorType extends SpectrumOneDimensionColor
  ? string
  : Color2D;

function getValue(spectrum: Spectrum1D | Spectrum2D, jpath: string[]) {
  const value = lodashGet(spectrum, jpath);

  if (typeof value === 'string') {
    return value;
  }

  if (['number', 'boolean'].includes(typeof value)) {
    return String(value);
  }

  if (value) {
    return JSON.stringify(value);
  }

  return value;
}

function isInstanceOfOneDimensionColor(
  item: SpectrumOneDimensionColor | SpectrumTwoDimensionsColor,
): item is SpectrumOneDimensionColor {
  return 'color' in item;
}

export function getCustomColor<
  SpectrumType extends Spectrum1D | Spectrum2D,
  ColorType extends SpectrumOneDimensionColor | SpectrumTwoDimensionsColor,
>(spectrum: SpectrumType, colors?: ColorType[]): ReturnColor<ColorType> | null {
  if (!colors || colors.length === 0) return null;

  let color: ReturnColor<ColorType> | null = null;
  for (const item of colors) {
    const value = getValue(spectrum, item.jpath);
    if (
      value &&
      item.value &&
      value.toLocaleLowerCase().includes(item.value.toLocaleLowerCase())
    ) {
      if (isInstanceOfOneDimensionColor(item)) {
        color = item.color as ReturnColor<ColorType>;
      } else {
        const { negativeColor, positiveColor } = item;
        color = { negativeColor, positiveColor } as ReturnColor<ColorType>;
      }
      break;
    }
  }

  return color;
}
