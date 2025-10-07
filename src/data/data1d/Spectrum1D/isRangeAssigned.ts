import type { Range } from '@zakodium/nmr-types';

export function isAssigned(object: { nbAtoms?: number; diaIDs?: string[] }) {
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
