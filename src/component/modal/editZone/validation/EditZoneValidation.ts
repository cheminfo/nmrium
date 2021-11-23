import { useMemo } from 'react';
import * as Yup from 'yup';

const useValidation = () =>
  useMemo(() => {
    return Yup.object().shape({
      signals: Yup.array()
        .of(
          Yup.object().shape({
            pathLength: Yup.object().shape({
              min: Yup.number().required().positive().integer(),
              max: Yup.number().required().positive().integer(),
              source: Yup.string(),
            }),
          }),
        )
        .min(1, 'There must be at least one signal in a zone!'),
    });
  }, []);

export default useValidation;
