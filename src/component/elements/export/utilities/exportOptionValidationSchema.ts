import { ExportSettings, Layout, PageSizeName, Unit } from 'nmr-load-save';
import * as Yup from 'yup';

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

// export const exportOptionValidationSchema = Yup.object().shape({
//   width: Yup.number()
//     .required()
//     .test(
//       'width-test',
//       `Width should be less or equal to ${MAX_PIXEL}`,
//       // eslint-disable-next-line func-names
//       function (value) {
//         // eslint-disable-next-line no-invalid-this
//         const { unit, dpi } = this.parent;
//         return testSize(value, unit, dpi);
//       },
//     ),

//   height: Yup.number()
//     .required()
//     .test(
//       'height-test',
//       `Height should be less or equal to ${MAX_PIXEL}`,
//       // eslint-disable-next-line func-names
//       function (value) {
//         // eslint-disable-next-line no-invalid-this
//         const { unit, dpi } = this.parent;
//         return testSize(value, unit, dpi);
//       },
//     ),

//   dpi: Yup.number().required(),
//   unit: Yup.mixed<Unit>().oneOf(unitsKeys, 'Unit is invalid').required(),
//   useDefaultSettings: Yup.boolean().required(),
// });

export const advanceExportOptionValidationSchema = Yup.object().shape({
  mode: Yup.string().oneOf(['basic', 'advance']).required(),
  width: Yup.number()
    .required()
    .test(
      'width-test',
      `Width should be less or equal to ${MAX_PIXEL}`,
      // eslint-disable-next-line func-names
      function (value) {
        // eslint-disable-next-line no-invalid-this
        const { unit, dpi } = this.parent;
        return testSize(value, unit, dpi);
      },
    ),

  height: Yup.number()
    .required()
    .test(
      'height-test',
      `Height should be less or equal to ${MAX_PIXEL}`,
      // eslint-disable-next-line func-names
      function (value) {
        // eslint-disable-next-line no-invalid-this
        const { unit, dpi } = this.parent;
        return testSize(value, unit, dpi);
      },
    ),

  dpi: Yup.number().required(),
  unit: Yup.mixed<Unit>().oneOf(unitsKeys).required(),
  useDefaultSettings: Yup.boolean().required(),
});

export const basicExportOptionValidationSchema = Yup.object().shape({
  mode: Yup.string().oneOf(['basic', 'advance']).required(),
  size: Yup.mixed<PageSizeName>()
    .oneOf(pageSizesKeys, 'Size is invalid')
    .required(),
  layout: Yup.mixed<Layout>()
    .oneOf(['portrait', 'landscape'], 'Layout is invalid')
    .required(),
  dpi: Yup.number().required(),
  useDefaultSettings: Yup.boolean().required(),
});

export const exportOptionValidationSchema = Yup.lazy(
  (values: ExportSettings) => {
    return values?.mode === 'advance'
      ? advanceExportOptionValidationSchema
      : basicExportOptionValidationSchema;
  },
);
