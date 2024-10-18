import type { ExportSettings } from 'nmr-load-save';
import { useDeferredValue, useRef, useState } from 'react';

import { roundNumber } from '../../utility/roundNumber.js';

import { convert, convertToPixels } from './units.js';
import { getExportOptions } from './utilities/getExportOptions.js';

export function useExportConfigurer(options: ExportSettings) {
  const { width, height, unit, dpi } = getExportOptions(options);
  const [isAspectRatioEnabled, enableAspectRatio] = useState(true);
  const refSize = useRef({ width, height, dpi });
  const previousUnit = useDeferredValue(unit);

  function changeSize(
    value: number,
    target: 'width' | 'height',
    source: 'width' | 'height',
  ) {
    if (isAspectRatioEnabled) {
      const aspectRation = refSize.current[target] / refSize.current[source];
      const newSize = value * aspectRation;
      refSize.current[target] = newSize;
      refSize.current[source] = value;
      return roundNumber(newSize, 2);
    } else {
      refSize.current[source] = value;
    }
    return value;
  }

  function changeDPI(value) {
    const { width, height, dpi } = refSize.current;
    const convertedWidth =
      convertToPixels(width, unit, 1, { precision: 2 }) * value;
    const convertedHeight =
      convertToPixels(height, unit, 1, { precision: 2 }) * value;
    return {
      width: roundNumber(convertedWidth / dpi, 2),
      height: roundNumber(convertedHeight / dpi, 2),
    };
  }

  function changeUnit({ unit }) {
    const w = convert(width, previousUnit, unit, dpi, { precision: 2 });
    const h = convert(height, previousUnit, unit, dpi, { precision: 2 });

    refSize.current = { width: w, height: h, dpi };

    return { width: w, height: h };
  }

  const widthInPixel = convertToPixels(width, unit, dpi, {
    precision: 0,
  });
  const heightInPixel = convertToPixels(height, unit, dpi, {
    precision: 0,
  });

  return {
    widthInPixel,
    heightInPixel,
    isAspectRatioEnabled,
    changeDPI,
    changeUnit,
    changeSize,
    enableAspectRatio,
  };
}
