import { axisUnits } from '@zakodium/nmrium-core';
import {
  svgLineStyleFieldsSchema,
  svgTextStyleFieldsSchema,
} from 'react-science/ui';
import { z } from 'zod';

const axisUnitValidation = z.enum(axisUnits);

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
    gridlines1D: gridlinesValidation,
    gridlines2D: gridlinesValidation,
    unit1D: z.object({ horizontal: axisUnitValidation }),
    units2D: z.object({
      direct: axisUnitValidation,
      indirect: axisUnitValidation,
    }),
  })
  .optional();
