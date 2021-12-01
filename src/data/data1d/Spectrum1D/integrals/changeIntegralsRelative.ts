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
    const { values, sum } = datum.integrals.values.reduce<{
      sum: number;
      values: Integral[];
    }>(
      (acc, integral, index) => {
        const newIntegralValue = integral.absolute / ratio;
        acc.sum += newIntegralValue;
        acc.values[index] = {
          ...integral,
          integral: newIntegralValue,
        };

        return acc;
      },
      { values: [], sum: 0 },
    );

    datum.integrals.values = values;
    datum.integrals.options.sum = sum;
  }
}
