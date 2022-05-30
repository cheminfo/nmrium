import { xyIntegration } from 'ml-spectra-processing';

import { DatumKind } from '../../../constants/SignalsKinds';
import { Datum1D, Range } from '../../../types/data1d';
import generateID from '../../../utilities/generateID';
import { getSpectrumErrorValue } from '../getSpectrumErrorValue';
import { getShiftX } from '../shift/getShiftX';

function checkRange(range: Range, datum: Datum1D, error) {
  // check if the range is already exists
  for (const { from, to } of datum.ranges?.values || []) {
    if (
      Math.abs(range.from - from) < error &&
      Math.abs(range.to - to) < error
    ) {
      return true;
    }
  }
}

export function mapRanges(ranges: Range[], datum: Datum1D) {
  const { x, re } = datum.data;
  const shiftX = getShiftX(datum);
  const error = getSpectrumErrorValue(datum);
  return ranges.reduce<Array<Range>>((acc, newRange) => {
    if (checkRange(newRange, datum, error) && newRange.id !== 'new') return acc;

    const absolute = xyIntegration(
      { x, y: re },
      { from: newRange.from, to: newRange.to, reverse: true },
    );
    const signals = newRange.signals.map((signal) => {
      const { kind = null, id, ...resSignal } = signal;
      return {
        kind: kind || 'signal',
        id: id || generateID(),
        originDelta: signal.delta - shiftX,
        ...resSignal,
      };
    });

    acc.push({
      ...newRange,
      kind: signals?.[0].kind || DatumKind.signal,
      originFrom: newRange.from - shiftX,
      originTo: newRange.to - shiftX,
      id: newRange.id || generateID(),
      absolute,
      signals,
    });

    return acc;
  }, []);
}
