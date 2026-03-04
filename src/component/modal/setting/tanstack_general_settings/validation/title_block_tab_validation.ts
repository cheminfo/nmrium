import { svgTextStyleFieldsSchema } from 'react-science/ui';
import { z } from 'zod';

import { jpathCodec, withUUID } from './utils.ts';

const infoBlockFieldTabValidation = z.object({
  format: z.string(),
  jpath: jpathCodec,
  visible: z.boolean(),
  label: z.string().min(1),
});

export const infoBlockFieldTabValidationWithUUID = withUUID(
  infoBlockFieldTabValidation,
);

const infoBlockFieldsTabValidation = z.array(
  infoBlockFieldTabValidationWithUUID,
);

export const infoBlockTabValidation = z.object({
  visible: z.boolean(),
  fields: infoBlockFieldsTabValidation,
  nameStyle: svgTextStyleFieldsSchema.optional(),
  valueStyle: svgTextStyleFieldsSchema.optional(),
});
