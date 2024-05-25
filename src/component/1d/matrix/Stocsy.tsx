import { extent } from 'd3';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { matrixToStocsy } from 'nmr-processing';
import { useMemo } from 'react';

import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import { PathBuilder } from '../../utility/PathBuilder';
import { getYScaleWithRation } from '../utilities/scale';

import {
  sliceArrayForDomain,
  groupPointsByColor,
  useMatrix,
} from './useMatrix';

interface StocsyProps {
  x: Float64Array | number[];
  y: number[];
  color: string[];
  scaleRatio: number;
  yDomain: number[];
}

interface StocsyIndexPointProps {
  chemicalShift: number | null;
}

interface StocsyData {
  x: Float64Array | number[];
  y: number[];
  color: string[];
  yDomain: number[];
}

function useStocsy(chemicalShift: number): StocsyData | null {
  const matrix = useMatrix();

  return useMemo(() => {
    if (!matrix) return null;

    const { x, matrixY } = matrix;

    const cIndex = xFindClosestIndex(x, chemicalShift ?? x[0]);
    const { color, y } = matrixToStocsy(matrixY, cIndex);
    const yDomain = extent(y) as number[];
    return {
      color,
      y,
      yDomain,
      x,
    };
  }, [chemicalShift, matrix]);
}

function useSliceStocsyData(options?: StocsyData | null) {
  const {
    xDomain: [from, to],
  } = useChartData();
  return useMemo(() => {
    if (!options) return null;

    const { color, y, x } = options;

    const fromIndex = xFindClosestIndex(x, from);
    const toIndex = xFindClosestIndex(x, to);
    return {
      x: sliceArrayForDomain(x, { fromIndex, toIndex }),
      y: sliceArrayForDomain(y, { fromIndex, toIndex }),
      color: sliceArrayForDomain(color, { fromIndex, toIndex }),
    };
  }, [from, options, to]);
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
  const stocsyData = useStocsy(chemicalShift);
  const data = useSliceStocsyData(stocsyData);
  const { displayerKey } = useChartData();

  if (!data || !stocsyData) return null;
  const { yDomain } = stocsyData;
  const { x, y, color } = data;
  return (
    <g clipPath={`url(#${displayerKey}clip-chart-1d)`}>
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
  const colorGroups = groupPointsByColor({ x, y, color });

  const xScaler = scaleX();

  return Object.keys(colorGroups).map((color) => {
    const points = colorGroups[color];
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
