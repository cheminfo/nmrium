import { ExportSettings } from 'nmr-load-save';

import { convertToPixels } from '../units';

import { getExportOptions } from './getExportOptions';

export function getSizeInPixel(exportPageOptions: ExportSettings) {
  const { width, height, dpi, unit } = getExportOptions(exportPageOptions);
  const widthInPixel = convertToPixels(width, unit, dpi, { precision: 0 });
  const heightInPixel = convertToPixels(height, unit, dpi, { precision: 0 });

  return { width: widthInPixel, height: heightInPixel };
}