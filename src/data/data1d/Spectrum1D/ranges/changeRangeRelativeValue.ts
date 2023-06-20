import { Spectrum1D } from 'nmr-load-save';

export interface ChangeRangeRelativeValueProps {
  id: string; // id of the selected range
  value: number; // New relative value
}

/**
 * Change Range relative value and re-calculate the relative values for the other ranges
 * @param {Spectrum1D} spectrum  spectrum 1d
 * @param {RangeProps} newRange
 */
export function changeRangeRelativeValue(
  spectrum: Spectrum1D,
  data: ChangeRangeRelativeValueProps,
) {
  const { id, value } = data;
  const index = spectrum.ranges.values.findIndex((range) => range.id === id);
  if (index !== -1 && spectrum.ranges.options.sum) {
    const { absolute, integration } = spectrum.ranges.values[index];
    const ratio = absolute / value;
    const sum = (value / integration) * spectrum.ranges.options.sum;
    spectrum.ranges.options = {
      ...spectrum.ranges.options,
      mf: undefined,
      moleculeId: undefined,
      sumAuto: false,
      sum,
    };

    spectrum.ranges.values = spectrum.ranges.values.map((range) => {
      return {
        ...range,
        integration: range.absolute / ratio,
      };
    });
  }
}
