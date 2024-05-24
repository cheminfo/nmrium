import { xFindClosestIndex } from 'ml-spectra-processing';
import { matrixToStocsy } from 'nmr-processing';

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
}

interface StocsyIndexPointProps {
  x: Float64Array | never[];
  color: string[];
  chemicalShift: number | null;
  xIndex: number;
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
  const matrix = useMatrix();

  if (!matrix) return null;

  const { x, matrixY } = matrix;
  const xIndex = xFindClosestIndex(x, chemicalShift ?? x[0], { sorted: false });
  const { color, y } = matrixToStocsy(matrixY, xIndex);

  return (
    <g>
      <StocsyIndexPoint
        x={x}
        color={color}
        chemicalShift={chemicalShift}
        xIndex={xIndex}
      />

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

function StocsyIndexPoint(props: StocsyIndexPointProps) {
  const { x, color, chemicalShift, xIndex } = props;
  const { scaleX } = useScaleChecked();

  const xPixel = scaleX()(chemicalShift ?? x[0]);
  const colorValue = color[xIndex];

  return (
    <g transform={`translate(${xPixel} 0)`}>
      <line
        x1={-0.5}
        y1={0}
        x2={-0.5}
        y2="100%"
        stroke={colorValue}
        strokeDasharray="5 2"
      />
    </g>
  );
}

function RenderStocsyAsSVG(props: StocsyProps) {
  const { x, y, color, scaleRatio } = props;
  const scaleY = useYScale(scaleRatio);
  const { scaleX } = useScaleChecked();
  const data = interpolatedColorsPoints({ x, y, color });

  const xScaler = scaleX();

  return Object.keys(data).map((color) => {
    const points = data[color];
    const pointDiff = x[1] - x[0];
    const pathBuilder = new PathBuilder();
    pathBuilder.moveTo(xScaler(points[0].x), scaleY(points[0].y));

    for (let i = 1; i < points.length; i++) {
      const segmentDiff = points[i].x - points[i - 1].x;

      if (segmentDiff >= pointDiff) {
        pathBuilder.moveTo(xScaler(points[i].x), scaleY(points[i].y));
      } else {
        pathBuilder.lineTo(xScaler(points[i].x), scaleY(points[i].y));
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
