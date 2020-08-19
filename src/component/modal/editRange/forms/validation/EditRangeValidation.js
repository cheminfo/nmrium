const EditRangeValidation = (values, rangeData) => {
  const errors = {};

  if (!values.newSignalDelta) {
    errors.newSignalDelta = 'required';
  } else if (
    values.newSignalDelta < rangeData.from ||
    values.newSignalDelta > rangeData.to
  ) {
    errors.newSignalDelta = ` ${rangeData.from.toFixed(
      5,
    )} ppm out of the range`;
  }

  if (
    values.newCouplingCoupling &&
    typeof values.newCouplingCoupling !== 'number'
  ) {
    errors.newCouplingCoupling = 'Must be a number';
  }

  if (!values.selectedSignalCouplings) {
    errors.selectedSignalCouplings = 'Invalid signal without couplings';
  } else if (values.selectedSignalCouplings.length === 0) {
    errors.selectedSignalCouplings =
      'There has to be at least one coupling in signal';
  }

  return errors;
};

export default EditRangeValidation;
