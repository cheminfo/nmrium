import type { Unit } from '@zakodium/nmrium-core';
import { EXTERNAL_API_KEYS } from '@zakodium/nmrium-core';
import { z } from 'zod/v4';

import { convertToPixels, units } from '../../../elements/export/units.ts';
import { pageSizes } from '../../../elements/print/pageSize.ts';

import { checkUniqueByKey, requiredString } from './validation/utils.ts';

const nucleiValidation = z
  .array(
    z.object({
      nucleus: requiredString('Nucleus is a required field'),
      ppmFormat: requiredString('PPM format is a required field'),
      hzFormat: requiredString('Hz format is a required field'),
    }),
  )
  .superRefine((nuclei, ctx) => {
    checkUniqueByKey(nuclei, 'nucleus', function onError(message, path) {
      ctx.addIssue({
        code: 'custom',
        message,
        path,
      });
    });
  });

const databaseValidation = z.object({
  data: z.array(
    z.object({
      label: requiredString('Label is a required field'),
      url: requiredString('URL is a required field'),
    }),
  ),
});

const infoBlockValidation = z.object({
  fields: z.array(
    z.object({
      label: requiredString(),
      jpath: z.array(z.string()).min(1),
    }),
  ),
});

const generalValidation = z.object({
  dimmedSpectraOpacity: z.number().min(0).max(1),
});

const spectraColorsValidation = z.object({
  oneDimension: z.array(
    z.object({
      value: requiredString(),
      jpath: z.array(z.string()).min(1),
    }),
  ),
  twoDimensions: z.array(
    z.object({
      value: requiredString(),
      jpath: z.array(z.string()).min(1),
    }),
  ),
});

const API_KEY_VALUES = EXTERNAL_API_KEYS.map(({ key }) => key) as [
  string,
  ...string[],
];

const externalAPIsValidation = z.array(
  z.object({
    key: z.enum(API_KEY_VALUES),
    serverLink: requiredString(),
    APIKey: requiredString(),
  }),
);

const MAX_PIXEL = 16000;
function testSize(value: number, unit: Unit, dpi: number) {
  const valueInPixel = convertToPixels(value, unit, dpi, {
    precision: 2,
  });
  if (value) {
    return valueInPixel <= MAX_PIXEL;
  }
  return true;
}

const unitsKeys = units.map(({ unit }) => unit, []);
const pageSizesKeys = pageSizes.map(({ name }) => name, []);
const exportItemValidation = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('basic'),
    size: z.enum(pageSizesKeys, 'Size is invalid'),
    layout: z.enum(['portrait', 'landscape'], 'Layout is invalid'),
    dpi: z.number(),
    useDefaultSettings: z.boolean(),
  }),
  z
    .object({
      mode: z.literal('advance'),
      width: z.number(),
      height: z.number(),
      dpi: z.number(),
      unit: z.enum(unitsKeys),
      useDefaultSettings: z.boolean(),
    })
    .superRefine((values, ctx) => {
      const { unit, dpi } = values;

      if (!testSize(values.width, unit, dpi)) {
        ctx.addIssue({
          code: 'custom',
          message: `Width should be less or equal to ${MAX_PIXEL}`,
          path: ['width'],
        });
      }

      if (!testSize(values.height, unit, dpi)) {
        ctx.addIssue({
          code: 'custom',
          message: `Height should be less or equal to ${MAX_PIXEL}`,
          path: ['height'],
        });
      }
    }),
]);

const exportValidation = z.object({
  png: exportItemValidation,
  svg: exportItemValidation,
  clipboard: exportItemValidation,
});

const peaksLabelValidation = z.object({
  marginTop: z.number().int().min(0),
});

export const workspaceValidation = z.object({
  nuclei: nucleiValidation,
  databases: databaseValidation,
  infoBlock: infoBlockValidation,
  general: generalValidation,
  spectraColors: spectraColorsValidation,
  externalAPIs: externalAPIsValidation,
  export: exportValidation,
  peaksLabel: peaksLabelValidation,
});
