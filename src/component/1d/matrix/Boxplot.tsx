import { NumberArray } from 'cheminfo-types';
import { extent } from 'd3';
import { matrixToBoxPlot } from 'nmr-processing';
import { CSSProperties, useMemo } from 'react';

import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import { PathBuilder } from '../../utility/PathBuilder';
import { getYScaleWithRation } from '../utilities/scale';

import { findXFromToIndex, sliceArray, useMatrix } from './useMatrix';

interface InnerBoxplotProps {
  scaleRatio: number;
}

interface BaseRenderProps extends InnerBoxplotProps {
  x: Float64Array | number[];
  color: CSSProperties['color'];
  yDomain: number[];
}

interface RenderPathProps extends BaseRenderProps {
  y: NumberArray;
}

interface RenderAreaProps extends BaseRenderProps {
  y1: NumberArray;
  y2: NumberArray;
}

interface UsePathLinePoints {
  x: Float64Array | number[];
  y: NumberArray;
}
interface UsePathAreaPoints {
  x: Float64Array | number[];
  y1: NumberArray;
  y2: NumberArray;
}

function useYScale(scaleRatio: number, yDomain) {
  const { margin, height } = useChartData();

  return getYScaleWithRation({
    height,
    yDomain,
    scaleRatio,
    margin,
  });
}

function usePath(pathPoints: UsePathLinePoints, scaleRatio: number, yDomain) {
  const { scaleX } = useScaleChecked();
  const scaleY = useYScale(scaleRatio, yDomain);

  const pathBuilder = new PathBuilder();

  const xScaler = scaleX();

  pathBuilder.moveTo(xScaler(pathPoints.x[0]), scaleY(pathPoints.y[0]));
  for (let i = 1; i < pathPoints.x.length; i++) {
    pathBuilder.lineTo(xScaler(pathPoints.x[i]), scaleY(pathPoints.y[i]));
  }
  return pathBuilder.toString();
}

function useAreaPath(
  pathPoints: UsePathAreaPoints,
  scaleRatio: number,
  yDomain,
) {
  const { scaleX } = useScaleChecked();
  const scaleY = useYScale(scaleRatio, yDomain);

  const pathBuilder = new PathBuilder();
  const pathBuilder2 = new PathBuilder();

  const xScaler = scaleX();

  pathBuilder.moveTo(xScaler(pathPoints.x[0]), scaleY(pathPoints.y1[0]));

  for (let i = 1; i < pathPoints.x.length; i++) {
    pathBuilder.lineTo(xScaler(pathPoints.x[i]), scaleY(pathPoints.y1[i]));
  }
  for (let i = pathPoints.x.length - 1; i >= 0; i--) {
    pathBuilder2.lineTo(xScaler(pathPoints.x[i]), scaleY(pathPoints.y2[i]));
  }

  return pathBuilder.concatPath(pathBuilder2);
}

function useBoxPlot() {
  const matrix = useMatrix();
  const {
    xDomain: [from, to],
  } = useChartData();

  return useMemo(() => {
    if (!matrix) return null;
    const { x, matrixY } = matrix;
    const { max, min, median, q1, q3 } = matrixToBoxPlot(matrixY);
    let { fromIndex, toIndex } = findXFromToIndex(x, { from, to });
    const yDomain = extent(median) as number[];

    if (fromIndex > 0) fromIndex--;
    if (toIndex < x.length) toIndex++;

    return {
      x: x.slice(fromIndex, toIndex),
      max: max.slice(fromIndex, toIndex),
      min: min.slice(fromIndex, toIndex),
      median: median.slice(fromIndex, toIndex),
      q1: q1.slice(fromIndex, toIndex),
      q3: q3.slice(fromIndex, toIndex),
      yDomain,
    };
  }, [from, matrix, to]);
}

export function Boxplot() {
  const {
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const options = usePanelPreferences('matrixGeneration', activeTab);

  if (!options) return;

  const { scaleRatio, showBoxPlot } = options;
  if (!showBoxPlot) return null;

  return <InnerBoxplot scaleRatio={scaleRatio} />;
}
export function InnerBoxplot(props: InnerBoxplotProps) {
  const { scaleRatio } = props;
  const data = useBoxPlot();
  const { displayerKey } = useChartData();

  if (!data) return null;

  const { x, max, min, median, q1, q3, yDomain } = data;

  return (
    <g clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      <RenderAreaPath
        x={x}
        y1={max}
        y2={min}
        color="black"
        scaleRatio={scaleRatio}
        yDomain={yDomain}
      />
      <RenderAreaPath
        x={x}
        y1={q3}
        y2={q1}
        color="black"
        scaleRatio={scaleRatio}
        yDomain={yDomain}
      />

      <RenderPath
        x={x}
        y={median}
        color="black"
        scaleRatio={scaleRatio}
        yDomain={yDomain}
      />
    </g>
  );
}

function RenderAreaPath(props: RenderAreaProps) {
  const { x, y1, y2, scaleRatio, color, yDomain } = props;
  const areaPath = useAreaPath({ x, y1, y2 }, scaleRatio, yDomain);

  return <path d={areaPath} fill={color} opacity={0.2} />;
}
function RenderPath(props: RenderPathProps) {
  const { x, y, scaleRatio, color, yDomain } = props;
  const areaPath = usePath({ x, y }, scaleRatio, yDomain);

  return <path d={areaPath} fill="transparent" stroke={color} />;
}