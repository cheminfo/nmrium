import { hasCouplingConstant } from '../../../../panels/extra/utilities/MultiplicityUtilities';

const EditRangeValidation = (values, rangeData) => {
  const errors = {};

  if (!values.newSignalDelta) {
    errors.newSignalDelta = 'required';
  } else if (
    values.newSignalDelta < rangeData.from ||
    values.newSignalDelta > rangeData.to
  ) {
    errors.newSignalDelta = ` ${values.newSignalDelta.toFixed(
      5,
    )} ppm out of the range`;
  }

  const createSignalsError = (i) => {
    if (!errors.signals) {
      errors.signals = {};
    }
    if (i !== undefined && !errors.signals[`${i}`]) {
      errors.signals[`${i}`] = { missingCouplings: [] };
    }
  };

  if (values.signals.length === 0) {
    createSignalsError();
    errors.signals.noSignals = 'There must be at least one signal in a range!';
  } else {
    values.signals.forEach((_signal, i) => {
      if (_signal.j.length === 0) {
        createSignalsError(i);
        if (!errors.signals.noCouplings) {
          errors.signals.noCouplings = [];
        }
        errors.signals.noCouplings.push({
          index: i,
          message: `There must be at least one coupling in signal ${i + 1}!`,
        });
      }
      _signal.j.forEach((_coupling, j) => {
        if (
          hasCouplingConstant(_coupling.multiplicity) &&
          _coupling.coupling === ''
        ) {
          createSignalsError(i);
          errors.signals[`${i}`].missingCouplings.push({
            index: j,
            message: `There are coupling values missing in signal ${i + 1}!`,
          });
        }
      });
    });
  }

  return errors;
};

export default EditRangeValidation;
