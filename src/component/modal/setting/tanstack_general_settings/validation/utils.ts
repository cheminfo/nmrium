import { z } from 'zod/v4';

export const jpathCodec = z.codec(z.string(), z.array(z.string().min(1)), {
  encode: (path) => path.join('.'),
  decode: (path) => path.split('.'),
});
