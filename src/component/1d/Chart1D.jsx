import { useScale } from '../context/ScaleContext';

import BaseLineZones from './BaseLineZones';
import IntegralsSeries from './IntegralsSeries';
import LinesSeries from './LinesSeries';
import PeaksNotations from './PeaksNotations';
import XAxis from './XAxis';
import MultiAnalysisRanges from './multiAnalysis/MultiAnalysisRanges';
import Ranges from './ranges/Ranges';

function Chart1D({ mode, width, height, margin, displayerKey }) {
  const { scaleX, scaleY } = useScale();
  if (!scaleX || !scaleY || !width || !height) return null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      id="nmrSVG"
    >
      <defs>
        <clipPath id={`${displayerKey}clip-chart-1d`}>
          <rect
            width={`${width - margin.left - margin.right}`}
            height={`${height}`}
            x={`${margin.left}`}
            y={`${0}`}
          />
        </clipPath>
      </defs>

      <LinesSeries />
      <IntegralsSeries />
      <PeaksNotations />
      <Ranges />
      <MultiAnalysisRanges />
      <BaseLineZones />

      <g className="container" style={{ pointerEvents: 'none' }}>
        <XAxis showGrid={true} mode={mode} />
        {/* <YAxis label="PPM" show={false} /> */}
      </g>
    </svg>
  );
}

export default Chart1D;
