import { memo } from 'react';

import { Datum1D } from '../../data/types/data1d';
import { useChartData } from '../context/ChartContext';
import { Margin } from '../reducer/Reducer';
import FloatMoleculeStructures from '../tool/FloatMoleculeStructures';

import XAxis from './XAxis';
import YAxis from './YAxis';
import { FidContainer } from './fid/FidContainer';
import { FTContainer } from './ft/FTContainer';
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
      <FTContainer spectra={spectra} />
      <FidContainer />
      <Zones />
      <IndicationLines axis="X" show />
      <IndicationLines axis="Y" show />

      <g className="container" style={{ pointerEvents: 'none' }}>
        <XAxis />
        <YAxis />
      </g>
      <FloatMoleculeStructures />
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
