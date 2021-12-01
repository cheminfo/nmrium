import { Datum1D } from '../../../../types/data1d';

export function updateRangesXShift(datum: Datum1D, shiftValue: number) {
  datum.ranges.values = datum.ranges.values.map((range) => ({
    ...range,
    from: (range.originFrom || 0) + shiftValue,
    to: (range.originTo || 0) + shiftValue,
    signals:
      range?.signals &&
      range.signals.map((s) => ({
        ...s,
        delta: (s.originDelta || 0) + shiftValue,
      })),
  }));
}
