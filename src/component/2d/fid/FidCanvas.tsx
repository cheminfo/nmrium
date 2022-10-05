/* eslint-disable @typescript-eslint/no-unused-vars */
import { matrixZPivotRescale } from 'ml-spectra-processing';
import {
  useEffect,
  useRef,
  CSSProperties,
  useContext,
  useCallback,
  useMemo,
} from 'react';

import { Datum2D } from '../../../data/types/data2d';
import { useChartData } from '../../context/ChartContext';
import useSpectrum from '../../hooks/useSpectrum';
import zoomHistoryManager from '../../reducer/helper/ZoomHistoryManager';
import { get2DXScale, get2DYScale } from '../utilities/scale';

export function FidCanvas() {
  const { width, height, margin, xDomain, yDomain, originDomain } =
    useChartData();

  const spectrum = useSpectrum() as Datum2D;
  const { left, top, right, bottom } = margin;

  const canvasWidth = width - right - left;
  const canvasHeight = height - top - bottom;

  const imageData = useMemo(() => {
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
      return new ImageData(matrixData, WIDTH, HEIGHT);
    }
  }, [spectrum]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const baseScale = useMemo(() => {
    const scaleX = canvasWidth > 1024 ? canvasWidth / 1024 : 1;
    const scaleY = canvasHeight > 1024 ? canvasHeight / 1024 : 1;
    return { scaleX, scaleY };
  }, [canvasHeight, canvasWidth]);

  useEffect(() => {
    if (canvasRef.current && imageData) {
      const context = canvasRef.current.getContext('2d');
      const imageObject = new Image();

      if (context && xDomain && yDomain) {
        const scale2dX = get2DXScale({
          margin,
          width,
          xDomain: originDomain.xDomain,
        });
        const scale2dY = get2DYScale({
          margin,
          height,
          yDomain: originDomain.yDomain,
        });
        const x1 = scale2dX(xDomain[1]) - margin.top;
        const y1 = scale2dY(yDomain[0]) - margin.left;
        const x2 = scale2dX(xDomain[0]) - margin.top;
        const y2 = scale2dY(yDomain[1]) - margin.left;

        const scaleX = canvasWidth / (x2 - x1);
        const scaleY = canvasHeight / (y2 - y1);

        context.putImageData(imageData, 0, 0);
        // eslint-disable-next-line func-names
        imageObject.onload = function () {
          context.resetTransform();
          context.clearRect(0, 0, canvasWidth, canvasHeight);
          context.translate(-x1 * scaleX, -y1 * scaleY);
          context.scale(scaleX, scaleY);
          context.drawImage(imageObject, 0, 0, canvasWidth, canvasHeight);
        };
        imageObject.src = context.canvas.toDataURL();
      }
    }
  }, [
    baseScale,
    canvasHeight,
    canvasWidth,
    height,
    imageData,
    margin,
    originDomain.xDomain,
    originDomain.yDomain,
    width,
    xDomain,
    yDomain,
  ]);

  return (
    <foreignObject
      {...{
        width: canvasWidth,
        height: canvasHeight,
        x: `${left}`,
        y: `${top}`,
      }}
    >
      <canvas
        ref={canvasRef}
        {...{ width: canvasWidth, height: canvasHeight }}
        style={{
          backgroundColor: 'white',
        }}
      />
    </foreignObject>
  );
}
