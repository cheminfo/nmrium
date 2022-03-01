import { FromTo } from 'cheminfo-types';
import DefaultPathLengths from '../../../../data/constants/DefaultPathLengths';

function isDefaultPathLength(
  pathLength: FromTo,
  experimentType: string,
): boolean {
  return (
    DefaultPathLengths[experimentType] &&
    pathLength.from === DefaultPathLengths[experimentType].from &&
    pathLength.to === DefaultPathLengths[experimentType].to
  );
}

export default isDefaultPathLength;
