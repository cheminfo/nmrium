import { Spectrum1D, SpectraRendering } from 'nmr-load-save';
import { memo } from 'react';

import SpectrumInfoBlock from '../1d-2d/components/SpectrumInfoBlock';
import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';
import { Margin } from '../reducer/Reducer';

import XAxis from './XAxis';
import YAxis from './YAxis';
import { FidContainer } from './fid/FidContainer';
import { FTContainer } from './ft/FTContainer';
import IndicationLines from './zones/IndicationLines';
import Zones from './zones/Zones';

interface Chart2DProps {
  spectra?: Spectrum1D[];
}

interface Chart2DInnerProps extends Chart2DProps {
  width: number;
  height: number;
  margin: Margin;
  displayerKey: string;
  SpectraRendering: SpectraRendering;
}

function chart2DInner({
  spectra,
  width,
  height,
  margin,
  displayerKey,
  SpectraRendering,
}: Chart2DInnerProps) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      id="nmrSVG"
      shapeRendering={SpectraRendering}
      style={{ position: 'absolute' }}
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
      <SpectrumInfoBlock />
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
  const {
    current: {
      general: { SpectraRendering },
    },
  } = usePreferences();

  return (
    <MemoizedChart2D
      {...{ spectra, width, height, margin, displayerKey, SpectraRendering }}
    />
  );
}
