import * as Yup from 'yup';

import { Workspace } from '../../workspaces/Workspace';

const formattingElementValidation = (obj: Workspace) =>
  Object.keys(obj.formatting.nuclei).reduce((validate, key) => {
    validate[key] = Yup.object().shape({
      name: Yup.string().trim().required('Nucleus is a required field'),
      ppm: Yup.string().trim().required('PPM format is a required field'),
      hz: Yup.string().trim().required('Hz format  is a required field'),
    });
    return validate;
  }, {});

const formattingValidation = (obj: Workspace) =>
  Yup.object().shape<any>({
    nuclei: Yup.object()
      .shape(formattingElementValidation(obj))
      .test(
        'Unique',
        'Nuclei need te be unique',
        function check(nuclei: Record<string, any>) {
          let nucleusFrequencies: Record<
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

          const errors = Object.keys(nucleusFrequencies).reduce<
            Yup.ValidationError[]
          >((errorList, key) => {
            const { value, fields } = nucleusFrequencies[key];
            if (value > 1) {
              for (let field of fields) {
                errorList.push(
                  new Yup.ValidationError(
                    `${key} nucleus must te be unique`,
                    nuclei[key].name,
                    `${this.path}.${field}.name`,
                  ),
                );
              }
            }
            return errorList;
          }, []);

          return new Yup.ValidationError(errors);
        },
      ),
  });

const databasesValidation = Yup.object().shape({
  data: Yup.array().of(
    Yup.object().shape({
      label: Yup.string().trim().required('Label is a required field'),
      url: Yup.string().trim().url().required('URL is a required field'),
    }),
  ),
});

export const validation = Yup.lazy((obj: Workspace) =>
  Yup.object().shape({
    formatting: formattingValidation(obj),
    databases: databasesValidation,
  }),
);
