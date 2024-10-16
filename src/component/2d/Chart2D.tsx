import { SpectraRendering, Spectrum1D } from 'nmr-load-save';
import { memo } from 'react';

import SpectrumInfoBlock from '../1d-2d/components/SpectrumInfoBlock.js';
import { useChartData } from '../context/ChartContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { ShareDataProvider } from '../context/ShareDataContext.js';
import { Margin } from '../reducer/Reducer.js';

import XAxis from './XAxis.js';
import YAxis from './YAxis.js';
import { FidContainer } from './fid/FidContainer.js';
import { FTContainer } from './ft/FTContainer.js';
import IndicationLines from './zones/IndicationLines.js';
import Zones from './zones/Zones.js';
import ZonesAssignmentsLabels from './zones/ZonesAssignmentsLabels.js';

interface Chart2DProps {
  spectra?: Spectrum1D[];
}

interface Chart2DInnerProps extends Chart2DProps {
  width: number;
  height: number;
  margin: Margin;
  displayerKey: string;
  spectraRendering: SpectraRendering;
}

function Chart2DInner({
  spectra,
  width,
  height,
  margin,
  displayerKey,
  spectraRendering,
}: Chart2DInnerProps) {
  return (
    <svg
      id="nmrSVG"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      fontFamily="Arial, Helvetica, sans-serif"
      shapeRendering={spectraRendering}
      style={{
        position: 'absolute',
      }}
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
      <ShareDataProvider>
        <Zones />
        <ZonesAssignmentsLabels />
      </ShareDataProvider>
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

const MemoizedChart2D = memo(Chart2DInner);

export default function Chart2D({ spectra }: Chart2DProps) {
  const { width, height, margin, displayerKey } = useChartData();
  const {
    current: {
      general: { spectraRendering },
    },
  } = usePreferences();

  return (
    <MemoizedChart2D
      {...{ spectra, width, height, margin, displayerKey, spectraRendering }}
    />
  );
}
