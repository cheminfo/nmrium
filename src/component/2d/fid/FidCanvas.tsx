import type { NmrData2DFid, NmrData2DFt } from 'cheminfo-types';
import { matrixZPivotRescale } from 'ml-spectra-processing';
import type { Spectrum2D } from 'nmrium-core';
import { useEffect, useMemo, useRef } from 'react';

import { isFid2DSpectrum } from '../../../data/data2d/Spectrum2D/isSpectrum2D.js';
import { useChartData } from '../../context/ChartContext.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import { get2DXScale, get2DYScale } from '../utilities/scale.js';

export function FidCanvas() {
  const { width, height, margin, xDomain, yDomain, originDomain, mode } =
    useChartData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const { left, top, right, bottom } = margin;
  const canvasWidth = width - right - left;
  const canvasHeight = height - top - bottom;

  const spectrum = useSpectrum() as Spectrum2D;
  const imageData = useMemo(() => getImageData(spectrum), [spectrum]);

  useEffect(() => {
    if (!imageData || !canvasRef.current) return;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }

    const offscreenCanvas = offscreenCanvasRef.current;
    const offscreenContext = offscreenCanvas.getContext('2d');
    const context = canvasRef.current.getContext('2d');

    if (!offscreenContext || !context) return;

    const scale2DX = get2DXScale({
      margin,
      mode,
      width,
      xDomain: originDomain.xDomain,
    });
    const scale2DY = get2DYScale({
      margin,
      height,
      yDomain: originDomain.yDomain,
    });

    const x1 = scale2DX(xDomain[0]) - top;
    const y1 = scale2DY(yDomain[0]) - left;
    const x2 = scale2DX(xDomain[1]) - top;
    const y2 = scale2DY(yDomain[1]) - left;

    const scaleY = canvasHeight / Math.abs(y2 - y1);
    const scaleX = canvasWidth / Math.abs(x2 - x1);

    // Set offscreen canvas size to original image size
    offscreenCanvas.width = imageData.width;
    offscreenCanvas.height = imageData.height;

    // Draw the original image data onto the offscreen canvas
    offscreenContext.putImageData(imageData, 0, 0);

    const baseScaleX = canvasWidth / imageData.width;
    const baseScaleY = canvasHeight / imageData.height;

    context.resetTransform();
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.scale(baseScaleX, baseScaleY);
    context.scale(scaleX, scaleY);
    context.translate(-x1 / baseScaleX, -y1 / baseScaleY);

    context.drawImage(offscreenCanvas, 0, 0);
  }, [
    canvasWidth,
    canvasHeight,
    imageData,
    margin,
    mode,
    width,
    originDomain.xDomain,
    originDomain.yDomain,
    height,
    xDomain,
    top,
    yDomain,
    left,
  ]);

  return (
    <foreignObject width={canvasWidth} height={canvasHeight} x={left} y={top}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ backgroundColor: 'white' }}
      />
    </foreignObject>
  );
}

function getImageData(spectrum: Spectrum2D) {
  const matrix = matrixZPivotRescale(
    isFid2DSpectrum(spectrum)
      ? (spectrum.data as NmrData2DFid).re.z
      : (spectrum.data as NmrData2DFt).rr.z,
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
