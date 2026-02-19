import { z } from 'zod';

const jpathCodec = z.codec(z.string(), z.array(z.string()), {
  encode: (path) => path.join('.'),
  decode: (path) => path.split('.'),
});

const infoBlockFieldTabValidation = z.object({
  format: z.string(),
  jpath: jpathCodec,
  visible: z.boolean(),
  label: z.string(),
});
export const infoBlockFieldTabValidationWithUUID = z.codec(
  z.object({ ...infoBlockFieldTabValidation.shape, uuid: z.string() }),
  infoBlockFieldTabValidation,
  {
    encode: (infoBlock) => ({
      ...infoBlockFieldTabValidation.decode(infoBlock),
      uuid: crypto.randomUUID(),
    }),
    decode: ({ uuid, ...infoBlock }) =>
      infoBlockFieldTabValidation.encode(infoBlock),
  },
);

const infoBlockFieldsTabValidation = z.array(
  infoBlockFieldTabValidationWithUUID,
);

export const infoBlockTabValidation = z.object({
  visible: z.boolean(),
  fields: infoBlockFieldsTabValidation,
});
