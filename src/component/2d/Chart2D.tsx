import { memo } from 'react';

import { Datum1D } from '../../data/data1d/Spectrum1D';
import { useChartData } from '../context/ChartContext';
import { Margin } from '../reducer/Reducer';

import Contours from './Contours';
import Left1DChart from './Left1DChart';
import Top1DChart from './Top1DChart';
import XAxis from './XAxis';
import YAxis from './YAxis';
import IndicationLines from './zones/IndicationLines';
import Zones from './zones/Zones';

interface Chart2DProps {
  spectra?: Datum1D[];
}

interface Chart2DInnerProps extends Chart2DProps {
  width: number;
  height: number;
  margin: Margin;
  displayerKey: string;
}

function chart2DInner({
  spectra,
  width,
  height,
  margin,
  displayerKey,
}: Chart2DInnerProps) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      id="nmrSVG"
    >
      <defs>
        <clipPath id={`${displayerKey}clip-chart-2d`}>
          <rect
            width={width - margin.left - margin.right}
            height={height - margin.top - margin.bottom}
            x={margin.left}
            y={margin.top}
          />
        </clipPath>
      </defs>
      <rect
        width={width - margin.left - margin.right}
        height={height - margin.top - margin.bottom}
        x={margin.left}
        y={margin.top}
        stroke="black"
        strokeWidth="1"
        fill="transparent"
      />
      {spectra?.[0] && <Top1DChart data={spectra[0]} />}
      {spectra?.[1] && <Left1DChart data={spectra[1]} />}
      <Contours />
      <Zones />
      <IndicationLines axis="X" show />
      <IndicationLines axis="Y" show />

      <g className="container" style={{ pointerEvents: 'none' }}>
        <XAxis />
        <YAxis />
      </g>
    </svg>
  );
}

const MemoizedChart2D = memo(chart2DInner);

export default function Chart2D({ spectra }: Chart2DProps) {
  const { width, height, margin, displayerKey } = useChartData();

  return (
    <MemoizedChart2D {...{ spectra, width, height, margin, displayerKey }} />
  );
}
