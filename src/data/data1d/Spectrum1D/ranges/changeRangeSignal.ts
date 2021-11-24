import { Datum1D } from '../../../types/data1d/Datum1D';

interface RangeSignalOption {
  rangeID: string;
  signalID: string;
  newSignalValue: number;
}

export function changeRangeSignal(datum: Datum1D, options: RangeSignalOption) {
  const { rangeID, signalID, newSignalValue } = options;

  let shiftValue = 0;
  const rangeIndex = datum.ranges.values.findIndex(
    (range) => range.id === rangeID,
  );
  if (rangeIndex !== -1) {
    const signalIndex = datum.ranges.values[rangeIndex].signals.findIndex(
      (signal) => signal.id === signalID,
    );
    shiftValue =
      newSignalValue -
      datum.ranges.values[rangeIndex].signals[signalIndex].delta;
    datum.ranges.values[rangeIndex].signals[signalIndex].delta = newSignalValue;
  }
  return shiftValue;
}
