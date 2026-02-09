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

const generalValidation = z.object({
  dimmedSpectraOpacity: z.coerce.number().min(0).max(1),
  invertActions: z.boolean(),
  invertScroll: z.boolean(),
  experimentalFeatures: z.boolean(),
  spectraRendering: z.enum([
    'auto',
    'optimizeSpeed',
    'crispEdges',
    'geometricPrecision',
  ]),
  popupLoggingLevel: z.enum(loggingLevel).optional(),
  loggingLevel: z.enum(loggingLevel).optional(),
});

const peaksLabelValidation = z.object({
  marginTop: z.coerce.number().int().min(0),
});

export const workspaceValidation = z.object({
  general: generalValidation,
  peaksLabel: peaksLabelValidation,
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
    invertActions: false,
    invertScroll: false,
    experimentalFeatures: false,
    spectraRendering: 'auto',
    loggingLevel: 'info',
    popupLoggingLevel: 'info',
  },
};
