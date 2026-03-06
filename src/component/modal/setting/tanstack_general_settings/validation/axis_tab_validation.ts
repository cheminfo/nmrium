import {
  svgLineStyleFieldsSchema,
  svgTextStyleFieldsSchema,
} from 'react-science/ui';
import { z } from 'zod';

export const gridlineValidation = z.object({
  enabled: z.boolean(),
  lineStyle: svgLineStyleFieldsSchema,
});

const gridlinesValidation = z.object({
  primary: gridlineValidation,
  secondary: gridlineValidation,
});

export const axisValidation = z
  .object({
    primaryTicks: z.object({ textStyle: svgTextStyleFieldsSchema }),
    secondaryTicks: z.object({ enabled: z.boolean() }),
    gridlines1D: gridlinesValidation,
    gridlines2D: gridlinesValidation,
  })
  .optional();
