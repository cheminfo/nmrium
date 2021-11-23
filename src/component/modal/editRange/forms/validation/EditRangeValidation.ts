import { useMemo } from 'react';
import * as Yup from 'yup';

import { hasCouplingConstant } from '../../../../panels/extra/utilities/MultiplicityUtilities';

const useValidation = () =>
  useMemo(() => {
    return Yup.object().shape({
      signals: Yup.array()
        .of(
          Yup.object().shape({
            j: Yup.array()
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
                      if (
                        (!hasCoupling && isNaN(value)) ||
                        (hasCoupling && !isNaN(value))
                      ) {
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
        )
        .min(1, 'There must be at least one signal in a range!'),
    });
  }, []);

export default useValidation;
