import * as Yup from 'yup';

import { hasCouplingConstant } from '../../../../panels/extra/utilities/MultiplicityUtilities';

const editRangeFormValidation = Yup.object().shape({
  signals: Yup.array().of(
    Yup.object().shape({
      js: Yup.array()
        .of(
          Yup.object().shape({
            multiplicity: Yup.string().required(),
            coupling: Yup.mixed().test(
              'checkValue',
              '',
              function testCoupling(value) {
                // eslint-disable-next-line no-invalid-this
                const { path, createError } = this;
                const hasCoupling = hasCouplingConstant(
                  // eslint-disable-next-line no-invalid-this
                  this.parent.multiplicity,
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
        .min(1, 'There must be at least one coupling in a signal'),
    }),
  ),
});

export default editRangeFormValidation;
