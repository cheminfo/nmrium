import { array, object, string, number } from 'yup';

import { checkUniqueByKey } from '../../utility/checkUniqueByKey';

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

export const validation: any = object().shape({
  nuclei: nucleiValidation,
  databases: databasesValidation,
  infoBlock: infoBlockValidation,
  general: generalValidation,
  spectraColors: spectraColorsSchemaValidation,
});
