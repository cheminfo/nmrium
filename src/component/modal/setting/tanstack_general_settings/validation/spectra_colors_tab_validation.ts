import { z } from 'zod/v4';

import { jpathCodec, withUUID } from './utils.ts';

const spectraColorsTabOneDimensionValidation = z.object({
  jpath: jpathCodec,
  value: z.string(),
  color: z.string(),
});
export const spectraColorsTabOneDimensionWithUUIDValidation = withUUID(
  spectraColorsTabOneDimensionValidation,
);

export const spectraColorsTabTwoDimensionValidation = z.object({
  jpath: jpathCodec,
  value: z.string(),
  positiveColor: z.string(),
  negativeColor: z.string(),
});
export const spectraColorsTabTwoDimensionWithUUIDValidation = withUUID(
  spectraColorsTabTwoDimensionValidation,
);

export const spectraColorsTabValidation = z.object({
  highlightColor: z.string(),
  indicatorLineColor: z.string(),
  oneDimension: z.array(spectraColorsTabOneDimensionWithUUIDValidation),
  twoDimensions: z.array(spectraColorsTabTwoDimensionWithUUIDValidation),
});
