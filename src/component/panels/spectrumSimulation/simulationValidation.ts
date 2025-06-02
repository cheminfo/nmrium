import * as Yup from 'yup';

const numberOrNull = Yup.mixed()
  .nullable()
  .test(
    'isNumberOrNull',
    'Must be a number or null',
    (value) => value === null || typeof value === 'number',
  );

export const simulationValidationSchema = Yup.object({
  options: Yup.object({
    frequency: Yup.number().required(),
    from: Yup.number()
      .required()
      .lessThan(
        Yup.ref('to'),
        "The range is invalid: 'From' must be smaller than 'To'",
      ),
    to: Yup.number()
      .required()
      .moreThan(
        Yup.ref('from'),
        "The range is invalid: 'To' must be greater than 'From'",
      ),
    nbPoints: Yup.number().required(),
    lineWidth: Yup.number().required().moreThan(0),
  }),
  data: Yup.array().of(Yup.array().of(numberOrNull)).required(),
});
