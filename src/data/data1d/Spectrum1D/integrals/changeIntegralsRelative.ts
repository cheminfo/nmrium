import type { Integral } from '@zakodium/nmr-types';
import type { Spectrum1D } from '@zakodium/nmrium-core';

export function changeIntegralsRelative(
  spectrum: Spectrum1D,
  data: { id: string; value: number },
) {
  const { id, value } = data;

  const index = spectrum.integrals.values.findIndex(
    (integral) => integral.id === id,
  );

  if (index !== -1) {
    const { absolute } = spectrum.integrals.values[index];
    const ratio = absolute / value;

    let sum = 0;
    const integrals: Integral[] = [];
    for (const integralRecord of spectrum.integrals.values) {
      const integral = integralRecord.absolute / ratio;
      sum += integral;
      integrals.push({ ...integralRecord, integral });
    }
    spectrum.integrals.values = integrals;
    spectrum.integrals.options = {
      ...spectrum.integrals.options,
      mf: undefined,
      moleculeId: undefined,
      sumAuto: false,
      sum,
    };
  }
}
