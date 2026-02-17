import { z } from 'zod/v4';

export const databasesValidation = z.object({
  defaultDatabase: z.string(),
  data: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      url: z.string(),
      enabled: z.boolean(),
    }),
  ),
});
