import { z } from 'zod';

import type { LoggerType } from '../../../../context/LoggerContext.tsx';

const loggingLevel: LoggerType[] = [
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'silent',
];

export const peaksLabelValidation = z.object({
  marginTop: z.coerce.number().int().min(0),
});

export const generalValidation = z.object({
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
});

export const displayGeneralValidation = z.object({
  experimentalFeatures: z.object({
    display: z.boolean(),
  }),
  hidePanelsBar: z.boolean().optional(),
});
