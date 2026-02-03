import { z } from 'zod/v4';

const generalValidation = z.object({
  dimmedSpectraOpacity: z.number().min(0).max(1),
});

export const workspaceValidation = z.object({
  general: generalValidation,
});
