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
    selectedSignalIndex: Yup.number().integer().min(-1).required(),
    selectedMultiplicityIndex: Yup.number().integer().min(-1).required(),
    // signals: Yup.array().min(0).required(),
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
  });
};

export default RangeValidationSchema;
