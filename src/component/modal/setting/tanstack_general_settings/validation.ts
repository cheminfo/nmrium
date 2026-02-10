import { z } from 'zod/v4';

import type { LoggerType } from '../../../context/LoggerContext.tsx';

const loggingLevel: LoggerType[] = [
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'silent',
];

export const workspaceValidation = z.object({
  peaksLabel: z.object({
    marginTop: z.coerce.number().int().min(0),
  }),
  general: z.object({
    dimmedSpectraOpacity: z.coerce.number().min(0).max(1),
    invert: z.boolean(),
    invertScroll: z.boolean(),
    spectraRendering: z.enum([
      'auto',
      'optimizeSpeed',
      'crispEdges',
      'geometricPrecision',
    ]),
    popupLoggingLevel: z.enum(loggingLevel).optional(),
    loggingLevel: z.enum(loggingLevel).optional(),
  }),
  display: z.object({
    general: z.object({
      experimentalFeatures: z.object({
        display: z.boolean(),
      }),
    }),
  }),
});

// This object is used to define type not real values. Do not use it as values
export const defaultGeneralSettingsFormValues: z.input<
  typeof workspaceValidation
> = {
  peaksLabel: {
    marginTop: 0,
  },
  general: {
    dimmedSpectraOpacity: 0,
    invert: false,
    invertScroll: false,
    spectraRendering: 'auto',
    loggingLevel: 'info',
    popupLoggingLevel: 'info',
  },
  display: {
    general: {
      experimentalFeatures: {
        display: false,
      },
    },
  },
};
