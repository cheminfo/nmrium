/* eslint-disable no-invalid-this */
import * as Yup from 'yup';

import { hasCouplingConstant } from '../../../../panels/extra/utilities/MultiplicityUtilities.js';

const editRangeFormValidation = Yup.object().shape({
  signals: Yup.array().of(
    Yup.object().shape({
      delta: Yup.number().required(),
      js: Yup.array()
        .of(
          Yup.object().shape({
            multiplicity: Yup.string().required(),
            coupling: Yup.mixed().test(
              'checkValue',
              '',
              function testCoupling(value) {
                const { path, createError } = this;
                const hasCoupling = hasCouplingConstant(
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
        .min(1, 'There must be at least one coupling in a signal')
        .test(
          'checkMultiplicity',
          'Massive multiplicity requires exactly one coupling',
          function test(js) {
            const multiplicity: string =
              js?.map((j) => j.multiplicity).join('') || '';

            if (multiplicity.includes('m') && js && js?.length > 1) {
              return this.createError({
                message: 'Massive multiplicity requires exactly one coupling',
              });
            }

            if (multiplicity.includes('s') && js && js?.length > 1) {
              return this.createError({
                message: 'Singlet multiplicity requires exactly one coupling',
              });
            }

            return true;
          },
        ),
    }),
  ),
});

export default editRangeFormValidation;
