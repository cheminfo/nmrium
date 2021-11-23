import DefaultPathLengths from '../../../../data/constants/DefaultPathLengths';
import PathLength from '../../../../data/types/data2d/PathLength';

function isDefaultPathLength(pathLength: PathLength, experimentType: string) {
  return (
    DefaultPathLengths[experimentType] &&
    DefaultPathLengths[experimentType].min === pathLength.min &&
    DefaultPathLengths[experimentType].max === pathLength.max
  );
}

export default isDefaultPathLength;
