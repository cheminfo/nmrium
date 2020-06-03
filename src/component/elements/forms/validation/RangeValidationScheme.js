import * as Yup from 'yup';

const RangeValidationSchema = (spectrumData) => {
  return Yup.object({
    from: Yup.number()
      .min(
        spectrumData.x[0],
        `Must be ${spectrumData.x[0].toFixed(5)} ppm or more`,
      )
      .max(
        spectrumData.x[spectrumData.x.length - 1],
        `Must be ${spectrumData.x[spectrumData.x.length - 1].toFixed(
          5,
        )} ppm or less`,
      )
      .required('Required'),
    to: Yup.number()
      .min(
        spectrumData.x[0],
        `Must be ${spectrumData.x[0].toFixed(5)} ppm or more`,
      )
      .max(
        spectrumData.x[spectrumData.x.length - 1],
        `Must be ${spectrumData.x[spectrumData.x.length - 1].toFixed(
          5,
        )} ppm or less`,
      )
      .required('Required'),
    newSignalFrom: Yup.number()
      .min(
        spectrumData.x[0],
        `Must be ${spectrumData.x[0].toFixed(5)} ppm or more`,
      )
      .max(
        spectrumData.x[spectrumData.x.length - 1],
        `Must be ${spectrumData.x[spectrumData.x.length - 1].toFixed(
          5,
        )} ppm or less`,
      )
      .required('Required'),
    newSignalTo: Yup.number()
      .min(
        spectrumData.x[0],
        `Must be ${spectrumData.x[0].toFixed(5)} ppm or more`,
      )
      .max(
        spectrumData.x[spectrumData.x.length - 1],
        `Must be ${spectrumData.x[spectrumData.x.length - 1].toFixed(
          5,
        )} ppm or less`,
      )
      .required('Required'),
    selectedSignalIndex: Yup.number().integer().min(-1).required(),
    signals: Yup.array()
      .min(1, 'There must be at least one signal')
      .required('Signals are required'),
    selectedSignalCouplings: Yup.array()
      .of(
        Yup.object().shape({
          coupling: Yup.number().moreThan(0.0, 'Must be greater than 0'),
        }),
      )
      .required('Invalid signal without couplings')
      .min(1, 'There has to be at least one coupling in signal'),
    newCouplingCoupling: Yup.number().moreThan(0.0, 'Must be greater than 0'),
  });
};

export default RangeValidationSchema;
