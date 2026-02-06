import { z } from 'zod/v4';

const generalValidation = z.object({
  dimmedSpectraOpacity: z.coerce.number().min(0).max(1),
  invertActions: z.boolean(),
  invertScroll: z.boolean(),
  experimentalFeatures: z.boolean(),
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
    invertActions: false,
    invertScroll: false,
    experimentalFeatures: false,
  },
};
