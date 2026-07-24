import * as Yup from 'yup';

import { hasCouplingConstant } from '../../../../panels/extra/utilities/MultiplicityUtilities.js';

const editRangeFormValidation = Yup.object().shape({
  signals: Yup.array()
    .of(
      Yup.object().shape({
        delta: Yup.number().required('Chemical shift is required'),
        js: Yup.array()
          .of(
            Yup.object().shape({
              multiplicity: Yup.string().required(),
              coupling: Yup.mixed().test(
                'checkValue',
                '',
                function testCoupling(value, context) {
                  const { path, createError } = context;
                  const hasCoupling = hasCouplingConstant(
                    context.parent.multiplicity,
                  );

                  if ((!hasCoupling && !value) || (hasCoupling && value)) {
                    return true;
                  }

                  return createError({
                    path,
                    message: `${path} is required`,
                  });
                },
              ),
            }),
          )
          .min(1, 'There must be at least one coupling in a signal')
          .test(
            'checkMultiplicity',
            'Massive multiplicity requires exactly one coupling',
            function test(js, context) {
              const multiplicity: string =
                js?.map((j) => j.multiplicity).join('') || '';

              if (multiplicity.includes('m') && js && js?.length > 1) {
                return context.createError({
                  message: 'Massive multiplicity requires exactly one coupling',
                });
              }

              if (multiplicity.includes('s') && js && js?.length > 1) {
                return context.createError({
                  message: 'Singlet multiplicity requires exactly one coupling',
                });
              }

              return true;
            },
          ),
      }),
    )
    .test(
      'within-range',
      'Chemical shift must be within the range',
      function checkRange(signals, context) {
        if (!Array.isArray(signals)) return true;

        const { from, to } = context.parent;

        const min = Math.min(from, to);
        const max = Math.max(from, to);

        const invalidIndex = signals?.findIndex(
          (signal) => signal.delta < min || signal.delta > max,
        );

        if (invalidIndex === -1) return true;
        return context.createError({
          path: `${context.path}[${invalidIndex}].delta`,
          message: `Delta must be between ${min} and ${max}`,
        });
      },
    ),
});

export default editRangeFormValidation;
