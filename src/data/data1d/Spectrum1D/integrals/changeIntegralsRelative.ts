import { Spectrum1D } from 'nmr-load-save';

export function changeIntegralsRelative(
  spectrum: Spectrum1D,
  data: { id: string; value: number },
) {
  const { id, value } = data;

  const index = spectrum.integrals.values.findIndex(
    (integral) => integral.id === id,
  );
  const { sum: baseSum } = spectrum.integrals.options;
  if (index !== -1 && typeof baseSum === 'number') {
    const { absolute, integral = 0 } = spectrum.integrals.values[index];
    const ratio = absolute / value;
    const sum = (value / integral) * baseSum;
    spectrum.integrals.options = {
      ...spectrum.integrals.options,
      mf: undefined,
      moleculeId: undefined,
      sumAuto: false,
      sum,
    };

    spectrum.integrals.values = spectrum.integrals.values.map((integral) => {
      return {
        ...integral,
        integral: integral.absolute / ratio,
      };
    });
  }
}
