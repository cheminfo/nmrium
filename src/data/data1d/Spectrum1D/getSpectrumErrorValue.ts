import { Datum1D } from "../../types/data1d/Datum1D";

export function getSpectrumErrorValue(datum: Datum1D) {
  const { x } = datum.data;
  return (x[x.length - 1] - x[0]) / 10000;
}
