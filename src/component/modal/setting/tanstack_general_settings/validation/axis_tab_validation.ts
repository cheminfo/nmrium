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

const primaryTicksValidation = z.object({
  textStyle: svgTextStyleFieldsSchema,
  tickStyle: svgLineStyleFieldsSchema.omit({
    strokeDasharray: true,
  }),
});
const secondaryTicksValidation = z.object({
  enabled: z.boolean(),
  tickStyle: svgLineStyleFieldsSchema.omit({
    strokeDasharray: true,
  }),
});

export const axisValidation = z
  .object({
    primaryTicks: primaryTicksValidation,
    secondaryTicks: secondaryTicksValidation,
    gridlines1D: gridlinesValidation,
    gridlines2D: gridlinesValidation,
  })
  .optional();
