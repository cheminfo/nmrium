import { z } from 'zod';

import { jpathCodec } from './utils.ts';

export const infoBlockFieldTabValidation = z.object({
  format: z.string(),
  jpath: jpathCodec,
  visible: z.boolean(),
  label: z.string(),
});

const infoBlockFieldsTabValidation = z.array(infoBlockFieldTabValidation);

export const infoBlockTabValidation = z.object({
  visible: z.boolean(),
  fields: infoBlockFieldsTabValidation,
});
