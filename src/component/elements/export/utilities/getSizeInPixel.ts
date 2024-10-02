import { UniversalExportSettings } from 'nmr-load-save';

import { convertToPixels } from '../units';

export function getSizeInPixel(exportPageOptions: UniversalExportSettings) {
  const { width, height, dpi, unit } = exportPageOptions;
  const widthInPixel = convertToPixels(width, unit, dpi);
  const heightInPixel = convertToPixels(height, unit, dpi);

  return { width: widthInPixel, height: heightInPixel };
}
