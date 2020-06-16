import * as Yup from 'yup';

const RangeValidationSchema = (rangeData) => {
  return Yup.object({
    from: Yup.number().required('from value is required'),
    to: Yup.number().required('to value is required'),
    newSignalDelta: Yup.number()
      .min(rangeData.from, `Must be ${rangeData.from.toFixed(5)} ppm or more`)
      .max(rangeData.to, `Must be ${rangeData.to.toFixed(5)} ppm or less`)
      .required('Required'),
    selectedSignalIndex: Yup.number().integer().min(-1).required(),
    signals: Yup.array(),
    selectedSignalCouplings: Yup.array()
      .of(
        Yup.object().shape({
          multiplicity: Yup.string().required(
            'Multiplicity in coupling is required',
          ),
          coupling: Yup.number(),
        }),
      )
      .required('Invalid signal without couplings')
      .min(1, 'There has to be at least one coupling in signal'),
    newCouplingCoupling: Yup.number(),
  });
};

export default RangeValidationSchema;
