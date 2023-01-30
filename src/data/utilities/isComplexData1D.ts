import { ComplexData1D } from '../types/data1d/ComplexData1D';
import { Data1D } from '../types/data1d/Data1D';

export function isComplexData1D(
  datum1D: Data1D,
): asserts datum1D is ComplexData1D {
  const { im, re } = datum1D;
  if (im === undefined || im.length !== re.length) {
    throw new Error(
      `data is not complex, im is not defined or re/im has different length`,
    );
  }
}
