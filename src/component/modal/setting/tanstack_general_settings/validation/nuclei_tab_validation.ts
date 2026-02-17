import { z } from 'zod';

import { checkUniqueByKey } from './check_unique_by_key.js';

export const nucleiValidation = z
  .array(
    z.object({
      nucleus: z.string({ error: 'Nucleus is a required field' }),
      ppmFormat: z.string({ error: 'PPM format is a required field' }),
      hzFormat: z.string({ error: 'Hz format  is a required field' }),
      axisFrom: z.coerce.number().optional(),
      axisTo: z.coerce.number().optional(),
    }),
  )
  .superRefine((nuclei, ctx) => {
    checkUniqueByKey({
      data: nuclei,
      checkKey: 'nucleus',
      context: ctx,
    });
  });
