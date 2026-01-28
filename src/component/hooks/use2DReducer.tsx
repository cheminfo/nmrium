import type { Spectrum2D } from '@zakodium/nmrium-core';
import type { NmrData2DContent, NmrData2DFt } from 'cheminfo-types';
import { xyEquallySpaced } from 'ml-spectra-processing';

import { useChartData } from '../context/ChartContext.tsx';

export interface SpectrumData extends Pick<Spectrum2D, 'display' | 'id'> {
  data: NmrData2DContent;
}
export function use2DReducer(spectra: Spectrum2D[]) {
  const { xDomain, yDomain } = useChartData();
  const [fromX, toX] = xDomain;
  const [fromY, toY] = yDomain;
  const outputSpectra: SpectrumData[] = [];
  for (const spectrum of spectra) {
    const { id, display, data } = spectrum;
    const { rr } = data as NmrData2DFt;
    const reducedData = reduce2DSpectrum(rr, {
      fromX,
      toX,
      fromY,
      toY,
    });
    outputSpectra.push({
      data: reducedData,
      id,
      display,
    });
  }
  return outputSpectra;
}

interface Reduce2DSpectrumOptions {
  numberOfPoints?: number;
  fromX?: number;
  toX?: number;
  fromY?: number;
  toY?: number;
}

function reduce2DSpectrum(
  data: NmrData2DContent,
  options: Reduce2DSpectrumOptions,
) {
  const {
    minY: originalMinY,
    minX: originalMinX,
    maxY: originalMaxY,
    maxX: originalMaxX,
    z,
  } = data;
  const { numberOfPoints = 1024, fromX, fromY, toX, toY } = options;
  const nbPointsY = z.length;
  const nbPointsX = z[0]?.length || 0;

  if (nbPointsX <= numberOfPoints && nbPointsY <= numberOfPoints) {
    return data;
  }

  const minX = fromX ?? originalMinX;
  const maxX = toX ?? originalMaxX;
  const minY = fromY ?? originalMinY;
  const maxY = toY ?? originalMaxY;

  const shouldReduceX = nbPointsX > numberOfPoints;
  const shouldReduceY = nbPointsY > numberOfPoints;

  const targetPointX = shouldReduceX ? numberOfPoints : nbPointsX;
  const targetPointY = shouldReduceY ? numberOfPoints : nbPointsY;

  let reducedX: Float64Array[] = [];
  // Reduce over x dimension
  if (shouldReduceX) {
    const xAXis = generate1DArray({
      min: originalMinX,
      max: originalMaxX,
      numberOfPoints: nbPointsX,
    });
    for (let row = 0; row < nbPointsY; row++) {
      const output = xyEquallySpaced(
        { x: xAXis, y: z[row] },
        {
          numberOfPoints: targetPointX,
          from: minX,
          to: maxX,
        },
      );
      reducedX[row] = Float64Array.from(output.y);
    }
  } else {
    reducedX = structuredClone(z);
  }

  if (!shouldReduceY) {
    return {
      ...data,
      minX,
      maxX,
      minY,
      maxY,
      z: reducedX,
    };
  }
  const yAXis = generate1DArray({
    min: originalMinY,
    max: originalMaxY,
    numberOfPoints: nbPointsY,
  });

  const reducedMatrix: Float64Array[] = [];

  for (let i = 0; i < targetPointY; i++) {
    reducedMatrix[i] = new Float64Array(targetPointX);
  }

  const colBuffer = new Float64Array(nbPointsY);

  //Reduce over y dimension
  for (let col = 0; col < targetPointX; col++) {
    for (let row = 0; row < nbPointsY; row++) {
      colBuffer[row] = reducedX[row][col];
    }
    const output = xyEquallySpaced(
      { x: yAXis, y: colBuffer },
      {
        numberOfPoints: targetPointY,
        from: minY,
        to: maxY,
      },
    );

    //resample column into the matrix
    for (let row = 0; row < targetPointY; row++) {
      reducedMatrix[row][col] = output.y[row];
    }
  }

  return {
    ...data,
    minX,
    maxX,
    minY,
    maxY,
    z: reducedMatrix,
  };
}

interface Generate1DArray {
  min: number;
  max: number;
  numberOfPoints: number;
}

function generate1DArray(options: Generate1DArray) {
  const { min, max, numberOfPoints } = options;
  const array = new Float64Array(numberOfPoints);
  const step = (max - min) / (numberOfPoints - 1);
  for (let i = 0; i < numberOfPoints; i++) {
    array[i] = min + i * step;
  }

  return array;
}
