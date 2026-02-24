import { z } from 'zod';

const jpathCodec = z.codec(z.string(), z.array(z.string()).min(1), {
  encode: (path) => path.join('.'),
  decode: (path) => path.split('.'),
});

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
