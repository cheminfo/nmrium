import type { Signal2D } from '@zakodium/nmr-types';
import { z } from 'zod';

import { SIGNAL_KINDS } from '../../../data/constants/signalsKinds.js';

function numberInput(schema: z.ZodNumber, message: string) {
  return z
    .union([z.number(), z.string().trim().min(1, message)])
    .transform(Number)
    .pipe(schema);
}

const pathLengthInput = numberInput(
  z
    .number({ error: 'Enter a positive integer.' })
    .int('Enter a positive integer.')
    .positive('Enter a positive integer.'),
  'Enter a path length.',
);

const axisSchema = z.looseObject({
  delta: numberInput(
    z.number({ error: 'Enter a chemical shift.' }),
    'Enter a chemical shift.',
  ),
  originalDelta: z.number(),
  nbAtoms: z.number().optional(),
  diaIDs: z.array(z.string()).optional(),
});

const zoneSignalSchema = z.looseObject({
  id: z.string(),
  kind: z.enum(SIGNAL_KINDS.map(({ value }) => value)).optional(),
  sign: z.number().optional(),
  peaks: z.custom<Signal2D['peaks']>().optional(),
  assignment: z.string().optional(),
  isAutoAssignment: z.boolean().optional(),
  x: axisSchema,
  y: axisSchema,
  j: z.object({
    pathLength: z
      .object({
        from: pathLengthInput,
        to: pathLengthInput,
      })
      .refine(({ from, to }) => to >= from, {
        message: 'Maximum must be at least the minimum.',
        path: ['to'],
      }),
  }),
});

export const zoneFormSchema = z.object({
  signals: z
    .array(zoneSignalSchema)
    .min(1, 'A zone must contain at least one signal.'),
});

export type FormData = z.input<typeof zoneFormSchema>;
export type ZoneSignal = z.output<typeof zoneSignalSchema>;

export const defaultZoneFormValues: FormData = { signals: [] };
