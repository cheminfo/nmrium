import { DataXY } from 'cheminfo-types';

export function getMassCenter(
  data: DataXY,
  options: { from?: number; to?: number },
): number {
  const { from = 0, to = data.x.length - 1 } = options;

  let cs = 0;
  let area = 0;
  for (let i = from; i <= to; i++) {
    cs += data.x[i] * data.y[i];
    area += data.y[i];
  }
  return cs / area;
}
