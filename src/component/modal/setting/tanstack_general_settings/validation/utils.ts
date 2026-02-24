import { z } from 'zod/v4';

export const jpathCodec = z.codec(z.string(), z.array(z.string()), {
  encode: (path) => path.join('.'),
  decode: (path) => path.split('.'),
});
