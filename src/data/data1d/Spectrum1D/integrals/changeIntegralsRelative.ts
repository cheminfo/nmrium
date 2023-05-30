import { Spectrum1D, Integral } from 'nmr-processing';

export function changeIntegralsRelative(
  spectrum: Spectrum1D,
  newIntegral: { id: string; value: number },
) {
  const index = spectrum.integrals.values.findIndex(
    (integral) => integral.id === newIntegral.id,
  );
  if (index !== -1) {
    const ratio = spectrum.integrals.values[index].absolute / newIntegral.value;
    const result: {
      sum: number;
      values: Integral[];
    } = { values: [], sum: 0 };
    for (const [index, integral] of spectrum.integrals.values.entries()) {
      const newIntegralValue = integral.absolute / ratio;
      result.sum += newIntegralValue;
      result.values[index] = {
        ...integral,
        integral: newIntegralValue,
      };
    }
    const { values, sum } = result;
    spectrum.integrals.values = values;
    spectrum.integrals.options = {
      ...spectrum.integrals.options,
      mf: undefined,
      moleculeId: undefined,
      sumAuto: false,
      sum,
    };
  }
}
