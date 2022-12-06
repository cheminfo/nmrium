import { v4 } from '@lukeed/uuid';
import { xyIntegration } from 'ml-spectra-processing';

import { DatumKind } from '../../../constants/SignalsKinds';
import { MapOptions, ShiftTarget } from '../../../types/common/MapOptions';
import { Datum1D, Range } from '../../../types/data1d';
import { Signal1D } from '../../../types/data1d/Signal1D';
import { getShiftX } from '../getShiftX';
import { getSpectrumErrorValue } from '../getSpectrumErrorValue';

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

function getRange(
  range: Range,
  shiftTarget: 'origin' | 'current',
  shift: number,
) {
  const { originFrom, originTo, from, to } = range;
  if (shiftTarget === 'origin') {
    return {
      originFrom: from - shift,
      originTo: to - shift,
      from,
      to,
    };
  } else {
    return {
      originFrom,
      originTo,
      from: (originFrom || 0) + shift,
      to: (originTo || 0) + shift,
    };
  }
}
function getSignalDelta(
  signal: Signal1D,
  shiftTarget: ShiftTarget,
  shift: number,
) {
  const { delta, originDelta } = signal;
  if (shiftTarget === 'origin') {
    return {
      originDelta: delta - shift,
      delta,
    };
  } else {
    return {
      originDelta,
      delta: (originDelta || 0) + shift,
    };
  }
}

export function mapRanges(
  ranges: Range[],
  datum: Datum1D,
  options: MapOptions = {},
) {
  const { checkIsExisting = true, shiftTarget = 'origin' } = options;
  const { x, re } = datum.data;
  const shiftX = getShiftX(datum);
  const error = getSpectrumErrorValue(datum);

  if (checkIsExisting) {
    ranges = ranges.filter(
      (r) =>
        (checkIsExisting && !checkRange(r, datum, error)) || r.id === 'new',
    );
  }
  return ranges.map((range) => {
    const rangeBoundary = getRange(range, shiftTarget, shiftX);

    const absolute = xyIntegration(
      { x, y: re },
      { from: rangeBoundary.from, to: rangeBoundary.to, reverse: true },
    );
    const signals = range.signals.map((signal) => {
      const { kind = null, id, ...resSignal } = signal;
      return {
        kind: kind || 'signal',
        id: id || v4(),
        ...resSignal,
        ...getSignalDelta(signal, shiftTarget, shiftX),
      };
    });
    return {
      ...range,
      id: range.id || v4(),
      kind: signals?.[0].kind || DatumKind.signal,
      ...rangeBoundary,
      absolute,
      signals,
    };
  });
}
