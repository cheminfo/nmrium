import { z } from 'zod/v4';

export const jpathCodec = z.codec(
  z.string().min(1),
  z.array(z.string().min(1)).min(1),
  {
    encode: (path) => path.join('.'),
    decode: (path) => (path ? path.split('.') : []),
  },
);
