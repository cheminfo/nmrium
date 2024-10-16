import { FromTo } from 'cheminfo-types';

import DefaultPathLengths from '../../../../data/constants/DefaultPathLengths.js';

export function isDefaultPathLength(
  pathLength: FromTo,
  experimentType: string,
): boolean {
  const { from, to } = DefaultPathLengths?.[experimentType] || {};
  return pathLength.from === from && pathLength.to === to;
}
