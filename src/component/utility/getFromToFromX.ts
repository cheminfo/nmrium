import { FromTo } from 'cheminfo-types';

const MAX_ZONES = 10;
//0,1,2,3,5,7,8,9,10
export default function getFromToFromX(x: Float64Array): FromTo[] {
  const zones: FromTo[] = [];
  let from = x[0];
  const deltaX = x[1] - x[0];
  const deltaTol = deltaX * 0.005;
  let i = 1;
  const lastIndex = x.length - 1;
  for (; i < x.length; i++) {
    if (Math.abs(x[i + 1] - x[i] - deltaX) > deltaTol) {
      zones.push({ from, to: x[i] });
      from = x[i + 1];
    }
    if (zones.length === MAX_ZONES) {
      return [{ from: x[0], to: x[lastIndex] }];
    }
  }

  zones.push({ from, to: x[i - 1] });
  return zones;
}
