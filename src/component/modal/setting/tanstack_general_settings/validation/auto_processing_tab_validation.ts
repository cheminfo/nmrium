import { Filters1D, Filters2D } from 'nmr-processing';
import { z } from 'zod/v4';

const filtersEnumNames = [
  ...Object.values(Filters1D).map((f) => f.name),
  ...Object.values(Filters2D).map((f) => f.name),
];

export const filtersValidation = z
  .array(
    z.object({
      name: z.enum(filtersEnumNames),
      enabled: z.boolean().optional(),
    }),
  )
  .optional();

export const autoProcessingTabValidation = z.object({
  autoProcessing: z.boolean(),
  filters: z.record(z.string(), filtersValidation).optional(),
});
