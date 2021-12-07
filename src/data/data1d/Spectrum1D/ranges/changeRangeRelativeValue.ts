import { Datum1D } from '../../../types/data1d';

interface RangeProps {
  id: string; // id of the selected range
  value: number; // New relative value
}

/**
 * Change Range relative value and re-calculate the relative values for the other ranges
 * @param {Datum1D} datum  spectrum 1d
 * @param {RangeProps} newRange
 */
export function changeRangeRelativeValue(datum: Datum1D, newRange: RangeProps) {
  const index = datum.ranges.values.findIndex(
    (range) => range.id === newRange.id,
  );
  if (index !== -1) {
    const { absolute, integration } = datum.ranges.values[index];
    const ratio = absolute / newRange.value;
    datum.ranges.options.sum =
      (newRange.value / integration) * datum.ranges.options.sum;
    datum.ranges.values = datum.ranges.values.map((range) => {
      return {
        ...range,
        integration: range.absolute / ratio,
      };
    });
  }
}
