import type { ExternalAPIKeyType } from 'nmr-load-save';
import { EXTERNAL_API_KEYS } from 'nmr-load-save';
import { array, mixed, number, object, string } from 'yup';

import { exportOptionValidationSchema } from '../../elements/export/utilities/exportOptionValidationSchema.js';
import { checkUniqueByKey } from '../../utility/checkUniqueByKey.js';

const nucleiValidation = array()
  .of(
    object().shape({
      nucleus: string().required('Nucleus is a required field'),
      ppmFormat: string().required('PPM format is a required field'),
      hzFormat: string().required('Hz format  is a required field'),
    }),
  )
  .test('Unique', 'Nuclei need te be unique', function check(nuclei) {
    // eslint-disable-next-line no-invalid-this
    return checkUniqueByKey(nuclei, 'nucleus', this);
  });

const databasesValidation = object().shape({
  data: array().of(
    object().shape({
      label: string().trim().required('Label is a required field'),
      url: string().trim().url().required('URL is a required field'),
    }),
  ),
});

const infoBlockValidation = object({
  fields: array().of(
    object({
      label: string().required(),
      jpath: array().of(string()).required().min(1),
    }),
  ),
});
const spectraColorsSchemaValidation = object({
  oneDimension: array().of(
    object({
      value: string().required(),
      jpath: array().of(string()).required().min(1),
    }),
  ),
  twoDimensions: array().of(
    object({
      value: string().required(),
      jpath: array().of(string()).required().min(1),
    }),
  ),
});
const generalValidation = object({
  dimmedSpectraOpacity: number().min(0).max(1).required(),
});
const externalAPIsValidation = array()
  .of(
    object({
      key: mixed<ExternalAPIKeyType>()
        .oneOf(EXTERNAL_API_KEYS.map(({ key }) => key))
        .required(),
      serverLink: string().url().required(),
      APIKey: string().required(),
    }),
  )
  .test(
    'Unique',
    'External API provider need te be unique',
    function check(apis) {
      // eslint-disable-next-line no-invalid-this
      return checkUniqueByKey(apis, 'key', this);
    },
  );

const exportValidation = object().shape({
  png: exportOptionValidationSchema,
  svg: exportOptionValidationSchema,
  clipboard: exportOptionValidationSchema,
});
const peaksLabelValidation = object().shape({
  marginTop: number().integer().required().min(0),
});

export const validation: any = object().shape({
  nuclei: nucleiValidation,
  databases: databasesValidation,
  infoBlock: infoBlockValidation,
  general: generalValidation,
  spectraColors: spectraColorsSchemaValidation,
  externalAPIs: externalAPIsValidation,
  export: exportValidation,
  peaksLabel: peaksLabelValidation,
});
