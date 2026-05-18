import { svgTextStyleFieldsSchema } from 'react-science/ui';
import { z } from 'zod';

import { jpathCodec, withUUID } from './utils.ts';

const spectraLabelFieldTabValidation = z.object({
  format: z.string(),
  jpath: jpathCodec,
  visible: z.boolean(),
});

export const spectraLabelFieldTabValidationWithUUID = withUUID(
  spectraLabelFieldTabValidation,
);

const spectraLabelFieldsTabValidation = z.array(
  spectraLabelFieldTabValidationWithUUID,
);

export const spectraLabelTabValidation = z.object({
  visible: z.boolean(),
  fields: spectraLabelFieldsTabValidation,
  valueStyle: svgTextStyleFieldsSchema.optional(),
});
