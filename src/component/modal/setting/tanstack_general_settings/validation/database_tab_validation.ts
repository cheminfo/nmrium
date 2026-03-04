import { z } from 'zod/v4';

import { checkUniqueByKey } from './check_unique_by_key.ts';

export const databasesValidation = z.object({
  defaultDatabase: z.string(),
  data: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
        url: z.string(),
        enabled: z.boolean(),
      }),
    )
    .superRefine((data, ctx) => {
      checkUniqueByKey({
        data,
        checkKey: 'key',
        context: ctx,
      });
    }),
});
