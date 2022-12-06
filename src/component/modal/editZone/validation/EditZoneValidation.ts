import * as Yup from 'yup';

const zoneFormValidation = Yup.object().shape({
  signals: Yup.array()
    .of(
      Yup.object().shape({
        j: Yup.object().shape({
          pathLength: Yup.object().shape({
            from: Yup.number().required().positive().integer(),
            to: Yup.number().required().positive().integer(),
          }),
        }),
      }),
    )
    .min(1, 'There must be at least one signal in a zone!'),
});

export default zoneFormValidation;
