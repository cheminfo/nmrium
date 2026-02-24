import { z } from 'zod/v4';

export const spectraColorsTabValidation = z.object({
  highlightColor: z.string(),
  indicatorLineColor: z.string(),
  oneDimension: z.array(
    z.object({
      jpath: z.array(z.string()),
      value: z.string(),
      color: z.string(),
    }),
  ),
  twoDimensions: z.array(
    z.object({
      jpath: z.array(z.string()),
      value: z.string(),
      positiveColor: z.string(),
      negativeColor: z.string(),
    }),
  ),
});
