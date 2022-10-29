import { Datum1D, Integral } from '../../../types/data1d';

export function changeIntegralsRelative(
  datum: Datum1D,
  newIntegral: { id: string; value: number },
) {
  const index = datum.integrals.values.findIndex(
    (integral) => integral.id === newIntegral.id,
  );
  if (index !== -1) {
    const ratio = datum.integrals.values[index].absolute / newIntegral.value;
    const result: {
      sum: number;
      values: Integral[];
    } = { values: [], sum: 0 };
    for (const [index, integral] of datum.integrals.values.entries()) {
      const newIntegralValue = integral.absolute / ratio;
      result.sum += newIntegralValue;
      result.values[index] = {
        ...integral,
        integral: newIntegralValue,
      };
    }
    const { values, sum } = result;
    datum.integrals.values = values;
    datum.integrals.options = {
      ...datum.integrals.options,
      mf: undefined,
      moleculeId: undefined,
      sumAuto: false,
      sum,
    };
  }
}
