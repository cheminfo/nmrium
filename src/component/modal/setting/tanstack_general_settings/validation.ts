import { z } from 'zod/v4';

const generalValidation = z.object({
  dimmedSpectraOpacity: z.number().min(0).max(1),
});

export const workspaceValidation = z.object({
  general: generalValidation,
});

// This object is used to define type not real values. Do not use it as values
export const defaultGeneralSettingsFormValues: z.input<
  typeof workspaceValidation
> = {
  general: {
    dimmedSpectraOpacity: 0,
  },
};
