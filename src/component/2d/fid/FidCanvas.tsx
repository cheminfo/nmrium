import { matrixZPivotRescale } from 'ml-spectra-processing';
import { useEffect, useRef, useMemo } from 'react';

import { Datum2D } from '../../../data/types/data2d';
import { Data2DFid, Data2DFt } from '../../../data/types/data2d/Data2D';
import { useChartData } from '../../context/ChartContext';
import useSpectrum from '../../hooks/useSpectrum';
import { get2DXScale, get2DYScale } from '../utilities/scale';

export function FidCanvas() {
  const { width, height, margin, xDomain, yDomain, originDomain } =
    useChartData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spectrum = useSpectrum() as Datum2D;
  const { left, top, right, bottom } = margin;

  const canvasWidth = width - right - left;
  const canvasHeight = height - top - bottom;

  const imageData = useMemo(() => getImageData(spectrum), [spectrum]);

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
        const x1 = scale2dX(xDomain[1]) - top;
        const y1 = scale2dY(yDomain[0]) - left;
        const x2 = scale2dX(xDomain[0]) - top;
        const y2 = scale2dY(yDomain[1]) - left;

        const w = Math.max(canvasWidth, imageData.width);
        const h = Math.max(canvasHeight, imageData.height);

        const baseScaleX = canvasWidth / imageData.width;
        const baseScaleY = canvasHeight / imageData.height;
        const scaleY = canvasHeight / (y2 - y1);
        const scaleX = canvasWidth / (x2 - x1);

        context.putImageData(imageData, 0, 0);

        // eslint-disable-next-line func-names, unicorn/prefer-add-event-listener
        imageObject.onload = function () {
          context.resetTransform();
          context.clearRect(0, 0, w, h);
          context.scale(baseScaleX, baseScaleY);
          context.translate(-x1 * scaleX, -y1 * scaleY);
          context.scale(scaleX, scaleY);
          context.drawImage(imageObject, 0, 0);
        };

        imageObject.src = context.canvas.toDataURL();
      }
    }
  }, [
    canvasHeight,
    canvasWidth,
    height,
    imageData,
    left,
    margin,
    originDomain,
    top,
    width,
    xDomain,
    yDomain,
  ]);

  if (!imageData) return null;

  const w = Math.max(canvasWidth, imageData.width);
  const h = Math.max(canvasHeight, imageData.height);

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
        {...{ width: w, height: h }}
        style={{
          backgroundColor: 'white',
        }}
      />
    </foreignObject>
  );
}

function getImageData(spectrum: Datum2D) {
  const { isFid } = spectrum.info;
  const matrix = matrixZPivotRescale(
    isFid
      ? (spectrum.data as Data2DFid).re.z
      : (spectrum.data as Data2DFt).rr.z,
    {
      max: 255,
      ArrayConstructor: Int16Array,
    },
  );
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
