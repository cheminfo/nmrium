import { z } from 'zod/v4';

import { jpathCodec } from './utils.ts';

export const spectraColorsTabOneDimensionValidation = z.object({
  jpath: jpathCodec,
  value: z.string(),
  color: z.string(),
});

export const spectraColorsTabTwoDimensionValidation = z.object({
  jpath: jpathCodec,
  value: z.string(),
  positiveColor: z.string(),
  negativeColor: z.string(),
});

export const spectraColorsTabValidation = z.object({
  highlightColor: z.string(),
  indicatorLineColor: z.string(),
  oneDimension: z.array(spectraColorsTabOneDimensionValidation),
  twoDimensions: z.array(spectraColorsTabTwoDimensionValidation),
});
