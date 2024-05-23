import { xFindClosestIndex } from 'ml-spectra-processing';
import { matrixToStocsy } from 'nmr-processing';
import { useEffect, useRef } from 'react';

import { useChartData } from '../../context/ChartContext';
import {
  withExport,
  withExportRegister,
} from '../../context/PrepareExportContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import { getYScaleWithRation } from '../utilities/scale';

import { useMatrix } from './useMatrix';

interface StocsyProps {
  x: Float64Array | never[];
  y: number[];
  color: string[];
  scaleRatio: number;
}
const circleRadius = 5;

const componentId = 'stocsy';

export function Stocsy() {
  const {
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const options = usePanelPreferences('matrixGeneration', activeTab);

  if (!options) return;

  const { scaleRatio, showStocsy, chemicalShift } = options;
  if (!showStocsy) return null;

  return <InnerStocsy scaleRatio={scaleRatio} chemicalShift={chemicalShift} />;
}
export function InnerStocsy({ scaleRatio, chemicalShift }) {
  const matrix = useMatrix();

  if (!matrix) return null;

  const { x, matrixY } = matrix;
  const xIndex = xFindClosestIndex(x, chemicalShift ?? x[0], { sorted: false });
  const { color, y } = matrixToStocsy(matrixY, 0);

  return (
    <g>
      <StocsyIndexPoint
        x={x}
        y={y}
        color={color}
        scaleRatio={scaleRatio}
        chemicalShift={chemicalShift}
        xIndex={xIndex}
      />

      <RenderStocsyAsCanvas x={x} y={y} color={color} scaleRatio={scaleRatio} />
      <RenderStocsyAsSVG x={x} y={y} color={color} scaleRatio={scaleRatio} />
    </g>
  );
}

function useYScale(scaleRatio: number) {
  const { margin, height, yDomain } = useChartData();

  return getYScaleWithRation({
    height,
    yDomain,
    scaleRatio,
    margin,
  });
}

const StocsyIndexPoint = (
  props: StocsyProps & { chemicalShift: number | null; xIndex: number },
) => {
  const { x, y, color, scaleRatio, chemicalShift, xIndex } = props;
  const scaleY = useYScale(scaleRatio);
  const { scaleX } = useScaleChecked();

  const xPixel = scaleX()(chemicalShift ?? x[0]);
  const yPixel = scaleY(y[xIndex]);
  const colorValue = color[xIndex];

  return (
    <g transform={`translate(${xPixel} ${yPixel})`}>
      <circle r={circleRadius} fill={colorValue} />
    </g>
  );
};

const RenderStocsyAsCanvas = withExportRegister((props: StocsyProps) => {
  const { x, y, color, scaleRatio } = props;

  const { width, margin, height } = useChartData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scaleY = useYScale(scaleRatio);
  const { scaleX } = useScaleChecked();

  const { right, bottom, left } = margin;
  const canvasWidth = width - right - left;
  const canvasHeight = height - bottom;
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

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
  const { x, y, color, scaleRatio } = props;
  const scaleY = useYScale(scaleRatio);
  const { scaleX } = useScaleChecked();

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
