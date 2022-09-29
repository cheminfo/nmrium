/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { matrixZPivotRescale } from 'ml-spectra-processing';
import { useEffect, useRef } from 'react';

import { Datum2D } from '../../data/types/data2d';
import { useChartData } from '../context/ChartContext';
import useSpectrum from '../hooks/useSpectrum';


export function FidCanvas() {
  const { displayerKey, width, height, margin } = useChartData();
  const spectrum = useSpectrum() as Datum2D;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (spectrum) {
      const matrix = matrixZPivotRescale(spectrum.data.z, {
        max: 255,
        ArrayConstructor: Int16Array,
      });
      const WIDTH = matrix[0].length;
      const HEIGHT = matrix.length;
      const arrayBuffer = new ArrayBuffer(WIDTH * HEIGHT * 4);
      const matrixData = new Uint8ClampedArray(arrayBuffer);
      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          const i = (y * WIDTH + x) * 4;

          if (matrix[y][x] > 0) {
            matrixData[i] = 255; // red
            matrixData[i + 1] = 0; // green
            matrixData[i + 2] = 0; // blue
            matrixData[i + 3] = matrix[y][x]; // alpha
          } else {
            matrixData[i] = 0; // red
            matrixData[i + 1] = 0; // green
            matrixData[i + 2] = 255; // blue
            matrixData[i + 3] = -matrix[y][x]; // alpha
          }
        }
      }

      const imageData = new ImageData(matrixData, WIDTH, HEIGHT);

      if (canvasRef.current) {
        console.log(canvasRef.current);

        const context = canvasRef.current.getContext('2d');

        console.log(context);

        if (context) {
          context.putImageData(imageData, 0, 0);
        }
      }

    }
  }, [height, spectrum, width]);

  if (spectrum?.info?.isFt) return null;

  const { left, top, right, bottom } = margin;

  const canvasWidth = width - right - left;
  const canvasHeight = height - top - bottom;

  return (
    <foreignObject {...{ width, height }}>
      <canvas
        ref={canvasRef}
        {...{ width: canvasWidth, height: canvasHeight }}
        style={{
          marginTop: `${top}px`,
          marginLeft: `${left}px`,
          backgroundColor: 'white',
        }}
      />
    </foreignObject>
  );
}
