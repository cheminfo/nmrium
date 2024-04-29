import { array, object, string, ValidationError, number } from 'yup';

const nucleiValidation = array()
  .of(
    object().shape({
      nucleus: string().trim().required('Nucleus is a required field'),
      ppmFormat: string().trim().required('PPM format is a required field'),
      hzFormat: string().trim().required('Hz format  is a required field'),
    }),
  )
  .test('Unique', 'Nuclei need te be unique', function check(nuclei) {
    if (!nuclei) return true;

    const nucleusFrequencies: Record<
      string,
      { value: number; fieldsIndexes: number[] }
    > = {};
    let index = 0;
    for (const nucleiPreferences of nuclei) {
      const key = nucleiPreferences.nucleus?.toLowerCase() || '';
      if (key) {
        if (nucleusFrequencies[key]) {
          ++nucleusFrequencies[key].value;
          nucleusFrequencies[key].fieldsIndexes.push(index);
        } else {
          nucleusFrequencies[key] = { value: 1, fieldsIndexes: [index] };
        }
      }
      index++;
    }

    const errors: ValidationError[] = [];
    for (const key in nucleusFrequencies) {
      const { value, fieldsIndexes } = nucleusFrequencies[key];
      if (value > 1) {
        for (const index of fieldsIndexes) {
          errors.push(
            new ValidationError(
              `${key} nucleus must te be unique`,
              nuclei[index].nucleus,
              // eslint-disable-next-line no-invalid-this
              `${this.path}.${index}.name`,
            ),
          );
        }
      }
    }
    return new ValidationError(errors);
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
  dimmedSpectraOpacity: number().required(),
});

export const validation: any = object().shape({
  nuclei: nucleiValidation,
  databases: databasesValidation,
  infoBlock: infoBlockValidation,
  general: generalValidation,
  spectraColors: spectraColorsSchemaValidation,
});
