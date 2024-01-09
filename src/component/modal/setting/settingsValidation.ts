import { Workspace } from 'nmr-load-save';
import {
  array,
  lazy,
  object,
  string,
  ValidationError,
  type ObjectShape,
  number,
} from 'yup';

const formattingElementValidation = (obj: Workspace): ObjectShape => {
  return Object.fromEntries(
    Object.keys(obj.formatting.nuclei).map((key) => [
      key,
      object().shape({
        name: string().trim().required('Nucleus is a required field'),
        ppm: string().trim().required('PPM format is a required field'),
        hz: string().trim().required('Hz format  is a required field'),
      }),
    ]),
  );
};

const formattingValidation = (obj: Workspace) =>
  object().shape<any>({
    nuclei: object()
      .shape(formattingElementValidation(obj))
      .test(
        'Unique',
        'Nuclei need te be unique',
        function check(nuclei: Record<string, any>) {
          const nucleusFrequencies: Record<
            string,
            { value: number; fields: string[] }
          > = {};
          for (const key of Object.keys(nuclei)) {
            const _key = nuclei[key].name?.toLowerCase() || '';
            if (_key) {
              if (nucleusFrequencies[_key]) {
                ++nucleusFrequencies[_key].value;
                nucleusFrequencies[_key].fields.push(key);
              } else {
                nucleusFrequencies[_key] = { value: 1, fields: [key] };
              }
            }
          }

          const errors: ValidationError[] = [];
          for (const key in nucleusFrequencies) {
            const { value, fields } = nucleusFrequencies[key];
            if (value > 1) {
              for (const field of fields) {
                errors.push(
                  new ValidationError(
                    `${key} nucleus must te be unique`,
                    nuclei[key].name,
                    // eslint-disable-next-line no-invalid-this
                    `${this.path}.${field}.name`,
                  ),
                );
              }
            }
          }

          return new ValidationError(errors);
        },
      ),
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

export const validation: any = lazy((obj: Workspace) =>
  object().shape({
    formatting: formattingValidation(obj),
    databases: databasesValidation,
    infoBlock: infoBlockValidation,
    general: generalValidation,
    spectraColors: spectraColorsSchemaValidation,
  }),
);
