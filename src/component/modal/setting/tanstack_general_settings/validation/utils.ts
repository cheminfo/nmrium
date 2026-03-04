import type { ZodCodec, ZodObject, ZodUUID } from 'zod';
import { z } from 'zod';
import type { $ZodObjectConfig, $ZodShape } from 'zod/v4/core';

export const jpathCodec = z.codec(
  z.string().min(1),
  z.array(z.string().min(1)).min(1),
  {
    encode: (path) => path.join('.'),
    decode: (path) => (path ? path.split('.') : []),
  },
);

/**
 * Add an uuid field to `z.input<validator>` and keep as-is the `z.output<validator>`.
 * It is mandatory for fields in table rows.
 * @param validator
 */
export function withUUID<ZT extends ZodObject<$ZodShape, $ZodObjectConfig>>(
  validator: ZT,
): ZodCodec<ZodObject<ZT['shape'] & { uuid: ZodUUID }>, ZT> {
  return z.codec(validator.extend({ uuid: z.uuid() }), validator, {
    encode: (value) => ({
      ...validator.decode(value),
      uuid: crypto.randomUUID(),
    }),
    decode: ({ uuid, ...value }) =>
      validator.encode(value as z.output<typeof validator>),
  });
}
