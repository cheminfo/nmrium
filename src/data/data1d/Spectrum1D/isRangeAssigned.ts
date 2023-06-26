import { Range, Signal1D } from 'nmr-processing';

function isAssigned(object: Range | Signal1D) {
  return (
    (object?.nbAtoms && object.nbAtoms > 0) ||
    (object?.diaIDs && object.diaIDs.length > 0)
  );
}

export function isRangeAssigned(range: Range) {
  if (isAssigned(range)) {
    return true;
  }
  return range?.signals.some((signal) => isAssigned(signal));
}
