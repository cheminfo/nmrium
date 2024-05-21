import { extent } from 'd3';
import { matrixToStocsy } from 'nmr-processing';
import { useEffect, useRef } from 'react';

import { useChartData } from '../../context/ChartContext';
import {
  withExport,
  withExportRegister,
} from '../../context/PrepareExportContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { getYScaleWithRation } from '../utilities/scale';

import { useMatrix } from './useMatrix';

interface StocsyProps {
  x: Float64Array | never[];
  y: Float64Array;
  color: string[];
  yDomain: number[];
}

const componentId = 'stocsy';

export function Stocsy() {
  const matrix = useMatrix();
  if (!matrix) return null;
  const { x, matrixY } = matrix;
  const { color, y } = matrixToStocsy(matrixY, 0);
  const yDomain = extent(y) as number[];

  return (
    <g>
      <RenderStocsyAsCanvas x={x} y={y} color={color} yDomain={yDomain} />
      <RenderStocsyAsSVG x={x} y={y} color={color} yDomain={yDomain} />
    </g>
  );
}

const RenderStocsyAsCanvas = withExportRegister((props: StocsyProps) => {
  const { x, y, color, yDomain } = props;

  const { width, margin, height } = useChartData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scaleX } = useScaleChecked();

  const scaleY = getYScaleWithRation({
    height,
    yDomain,
    scaleRatio: 1,
    margin,
  });

  const { right, bottom } = margin;
  const canvasWidth = width - right;
  const canvasHeight = height - bottom;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (ctx) {
      ctx.fillStyle = 'background-color: transparent';
    }

    // Function to draw lines in a rectangle
    function drawLinesInRect(x1, x2, y1, y2, color) {
      if (!ctx) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, x2);
      ctx.lineTo(y1, y2);
      ctx.stroke();
    }

    let index = 0;
    for (const val of x) {
      if (index === x.length - 1) {
        break;
      }
      const nextIndex = index + 1;

      const x1 = scaleX()(val);
      const y1 = scaleY(y[index]);
      const x2 = scaleX()(x[nextIndex]);
      const y2 = scaleY(y[nextIndex]);

      drawLinesInRect(x1, y1, x2, y2, color[index]);
      index++;
    }

    return () => {
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [color, height, scaleX, scaleY, width, x, y]);

  return (
    <foreignObject
      {...{
        width: canvasWidth,
        height: canvasHeight,
      }}
      data-no-export="true"
    >
      <canvas
        ref={canvasRef}
        {...{ width: canvasWidth, height: canvasHeight }}
      />
    </foreignObject>
  );
}, componentId);

const RenderStocsyAsSVG = withExport((props: StocsyProps) => {
  const { x, y, color, yDomain } = props;
  const { margin, height } = useChartData();
  const { scaleX } = useScaleChecked();

  const scaleY = getYScaleWithRation({
    height,
    yDomain,
    scaleRatio: 1,
    margin,
  });

  return Array.from(x).map((val, index) => {
    if (index === x.length - 1 || typeof val !== 'number') {
      return null;
    }
    const nextIndex = index + 1;
    const x1 = scaleX()(val);
    const y1 = scaleY(y[index]);
    const x2 = scaleX()(x[nextIndex]);
    const y2 = scaleY(y[nextIndex]);

    return (
      <path
        key={`${val}`}
        d={`M${x1},${y1} L${x2},${y2} Z`}
        fill="transparent"
        stroke={color[index]}
      />
    );
  });
}, componentId);
