import { extent } from 'd3';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { matrixToStocsy } from 'nmr-processing';
import { useMemo } from 'react';

import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import { PathBuilder } from '../../utility/PathBuilder';
import { getYScaleWithRation } from '../utilities/scale';

import { interpolatedColorsPoints, useMatrix } from './useMatrix';

interface StocsyProps {
  x: Float64Array | never[];
  y: number[];
  color: string[];
  scaleRatio: number;
  yDomain: number[];
}

interface StocsyIndexPointProps {
  chemicalShift: number | null;
}

function useStocsy(chemicalShift: number) {
  const matrix = useMatrix();
  const {
    xDomain: [from, to],
  } = useChartData();

  return useMemo(() => {
    if (!matrix) return null;

    const { x, matrixY } = matrix;
    const fromIndex = xFindClosestIndex(x, from);
    const toIndex = xFindClosestIndex(x, to);

    const cIndex = xFindClosestIndex(x, chemicalShift ?? x[0]);
    const { color, y } = matrixToStocsy(matrixY, cIndex);

    const yDomain = extent(y) as number[];

    return {
      x: x.slice(fromIndex, toIndex),
      y: y.slice(fromIndex, toIndex),
      color: color.slice(fromIndex, toIndex),
      yDomain,
    };
  }, [chemicalShift, from, matrix, to]);
}

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
  const data = useStocsy(chemicalShift);

  if (!data) return null;
  const { x, y, color, yDomain } = data;
  return (
    <g>
      <StocsyIndexPoint chemicalShift={chemicalShift} />

      <RenderStocsyAsSVG
        x={x}
        y={y}
        color={color}
        scaleRatio={scaleRatio}
        yDomain={yDomain}
      />
    </g>
  );
}

function useYScale(scaleRatio: number, yDomain: number[]) {
  const { margin, height } = useChartData();

  return getYScaleWithRation({
    height,
    yDomain,
    scaleRatio,
    margin,
  });
}

function StocsyIndexPoint(props: StocsyIndexPointProps) {
  const { chemicalShift } = props;
  const { scaleX } = useScaleChecked();
  const {
    xDomain: [from, to],
  } = useChartData();

  if (!chemicalShift || chemicalShift < from || chemicalShift > to) return null;

  const xPixel = scaleX()(chemicalShift);

  return (
    <g transform={`translate(${xPixel} 0)`}>
      <line
        x1={-0.5}
        y1={0}
        x2={-0.5}
        y2="100%"
        stroke="red"
        strokeDasharray="5 2"
      />
    </g>
  );
}

function RenderStocsyAsSVG(props: StocsyProps) {
  const { x, y, color, scaleRatio, yDomain } = props;
  const scaleY = useYScale(scaleRatio, yDomain);
  const { scaleX } = useScaleChecked();
  const data = interpolatedColorsPoints({ x, y, color });

  const xScaler = scaleX();

  return Object.keys(data).map((color) => {
    const points = data[color];
    const pathBuilder = new PathBuilder();

    pathBuilder.moveTo(xScaler(points[0].x), scaleY(points[0].y));

    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      pathBuilder.lineTo(xScaler(points[i].x), scaleY(points[i].y));
      if (point.endPath && i < points.length - 1) {
        pathBuilder.moveTo(xScaler(points[i + 1].x), scaleY(points[i + 1].y));
      }
    }
    return (
      <path
        key={color}
        d={pathBuilder.toString()}
        stroke={color}
        fill="transparent"
      />
    );
  });
}
