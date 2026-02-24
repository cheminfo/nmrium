import {
  svgLineStyleFieldsSchema,
  svgTextStyleFieldsSchema,
} from 'react-science/ui';
import { z } from 'zod';

const axisUnit = ['ppm', 'hz', 'pt'] as const;
const axisUnitValidation = z.enum(axisUnit);

const gridlineValidation = z.object({
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
    gridlines1d: gridlinesValidation,
    gridlines2d: gridlinesValidation,
    units: z.object({
      dimension1: z.object({ horizontal: axisUnitValidation }),
      dimension2: z.object({
        direct: axisUnitValidation,
        indirect: axisUnitValidation,
      }),
    }),
  })
  .optional();
