import type { NmrData2DContent } from 'cheminfo-types';

import type { Reduce2DSpectrumOptions } from './use2DReducer.tsx';

export function reduce2DSpectrum(
  data: NmrData2DContent,
  options: Reduce2DSpectrumOptions = {},
) {
  const {
    minY: originalMinY,
    minX: originalMinX,
    maxY: originalMaxY,
    maxX: originalMaxX,
    z,
  } = data;
  const {
    numberOfPoints = 512,
    fromX = originalMinX,
    fromY = originalMinY,
    toX = originalMaxX,
    toY = originalMaxY,
  } = options;
  const nbPointsY = z.length;
  const nbPointsX = z[0]?.length || 0;

  if (nbPointsX <= numberOfPoints && nbPointsY <= numberOfPoints) {
    return data;
  }

  // need to find the indices in X and Y taking care that we are not out of bounds
  const deltaX = (originalMaxX - originalMinX) / (nbPointsX - 1);
  const deltaY = (originalMaxY - originalMinY) / (nbPointsY - 1);

  const indexFromX = Math.max(0, Math.floor((fromX - originalMinX) / deltaX));
  const indexToX = Math.min(
    nbPointsX - 1,
    Math.ceil((toX - originalMinX) / deltaX),
  );
  const indexFromY = Math.max(0, Math.floor((fromY - originalMinY) / deltaY));
  const indexToY = Math.min(
    nbPointsY - 1,
    Math.ceil((toY - originalMinY) / deltaY),
  );

  const sourceNbPointsX = indexToX - indexFromX + 1;
  const sourceNbPointsY = indexToY - indexFromY + 1;
  const newNbPointsX = Math.min(sourceNbPointsX, numberOfPoints);
  const newNbPointsY = Math.min(sourceNbPointsY, numberOfPoints);

  // create the result object and fill with typed arrays
  const reducedMatrix = [];
  for (let i = 0; i < newNbPointsY; i++) {
    reducedMatrix.push(new Float64Array(newNbPointsX));
  }

  // Fill the reducedMatrix by aggregating the original values in each rectangle.
  // If the sum of values in the rectangle is positive, take the max; otherwise take the min.

  for (let newRow = 0; newRow < newNbPointsY; newRow++) {
    const srcRowStart =
      indexFromY + Math.floor((newRow * sourceNbPointsY) / newNbPointsY);
    const srcRowEnd =
      indexFromY + Math.floor(((newRow + 1) * sourceNbPointsY) / newNbPointsY);

    for (let newCol = 0; newCol < newNbPointsX; newCol++) {
      const srcColStart =
        indexFromX + Math.floor((newCol * sourceNbPointsX) / newNbPointsX);
      const srcColEnd =
        indexFromX +
        Math.floor(((newCol + 1) * sourceNbPointsX) / newNbPointsX);

      let sum = 0;
      let min = Number.POSITIVE_INFINITY;
      let max = Number.NEGATIVE_INFINITY;

      for (let row = srcRowStart; row < srcRowEnd; row++) {
        const rowData = z[row];
        for (let col = srcColStart; col < srcColEnd; col++) {
          const value = rowData[col];
          sum += value;
          if (value < min) min = value;
          if (value > max) max = value;
        }
      }

      reducedMatrix[newRow][newCol] = sum >= 0 ? max : min;
    }
  }

  return {
    ...data,
    minX: originalMinX + indexFromX * deltaX,
    maxX: originalMinX + indexToX * deltaX,
    minY: originalMinY + indexFromY * deltaY,
    maxY: originalMinY + indexToY * deltaY,
    z: reducedMatrix,
  };
}
