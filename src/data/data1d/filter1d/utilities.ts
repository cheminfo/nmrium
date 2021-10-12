export function isApplicable(datum1D) {
  if (datum1D.info.isComplex && !datum1D.info.isFid) return true;
  return false;
}

export function reduceNull() {
  return {
    once: false,
    reduce: null,
  };
}

export function reduceWithNewValue(previousValue, newValue) {
  return {
    once: true,
    reduce: newValue,
  };
}

export function reduceCombinePreviusAndNew(previousValue, newValue) {
  return {
    once: true,
    reduce: previousValue + newValue,
  };
}