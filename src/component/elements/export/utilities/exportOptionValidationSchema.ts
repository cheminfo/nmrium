import type { Unit } from '@zakodium/nmrium-core';
import { z } from 'zod/v4';

import { pageSizes } from '../../print/pageSize.js';
import { convertToPixels, units } from '../units.js';

const MAX_PIXEL = 16000;

const unitsKeys = units.map(({ unit }) => unit, []);
const pageSizesKeys = pageSizes.map(({ name }) => name, []);

function testSize(value: number, unit: Unit, dpi: number) {
  const valueInPixel = convertToPixels(value, unit, dpi, {
    precision: 2,
  });

  if (value) {
    return valueInPixel <= MAX_PIXEL;
  }

  return true;
}

const basicExportOptionValidationSchemaZod = z.object({
  mode: z.literal('basic'),
  size: z.enum(pageSizesKeys, { error: 'Size is invalid' }),
  layout: z.enum(['portrait', 'landscape'], 'Layout is invalid'),
  dpi: z.coerce.number().min(1, { error: 'DPI is invalid' }),
  useDefaultSettings: z.boolean(),
});

const advanceExportOptionValidationSchemaZod = z
  .object({
    mode: z.literal('advance'),
    width: z.coerce.number<string>(),
    height: z.coerce.number<string>(),
    dpi: z.coerce.number<string>().min(1, { error: 'DPI is invalid' }),
    unit: z.enum(unitsKeys),
    useDefaultSettings: z.boolean(),
  })
  .superRefine((data, context) => {
    const { dpi, unit, height, width } = data;

    if (!testSize(width, unit, dpi)) {
      context.addIssue({
        code: 'custom',
        message: `Width should be less or equal to ${MAX_PIXEL}`,
        path: ['width'],
      });
    }

    if (!testSize(height, unit, dpi)) {
      context.addIssue({
        code: 'custom',
        message: `Height should be less or equal to ${MAX_PIXEL}`,
        path: ['height'],
      });
    }
  });

export const exportOptionValidationSchemaZod = z.discriminatedUnion('mode', [
  basicExportOptionValidationSchemaZod,
  advanceExportOptionValidationSchemaZod,
]);
