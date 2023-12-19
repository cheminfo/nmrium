import SpectrumInfoBlock from '../1d-2d/components/SpectrumInfoBlock';
import { usePreferences } from '../context/PreferencesContext';

import ApodizationLine from './ApodizationLine';
import ExclusionZonesAnnotations from './ExclusionZonesAnnotations';
import LinesSeries from './LinesSeries';
import SpectraTracker from './SpectraLegends';
import XAxis from './XAxis';
import DatabaseElements from './database/DatabaseElements';
import IntegralsSeries from './integral/IntegralsSeries';
import JGraph from './jCouplingGraph/JGraph';
import MultiAnalysisRanges from './multiAnalysis/MultiAnalysisRanges';
import { PeakEditionProvider } from './peaks/PeakEditionManager';
import Peaks from './peaks/Peaks';
import PeaksShapes from './peaks/PeaksShapes';
import Ranges from './ranges/Ranges';
import RangesIntegrals from './ranges/RangesIntegrals';
import BaseLineZones from './tool/BaseLineZones';

function Chart1D({ mode, width, height, margin, displayerKey }) {
  const {
    current: {
      general: { spectraRendering },
    },
  } = usePreferences();
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.bottom;
  return (
    <PeakEditionProvider>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        id="nmrSVG"
        shapeRendering={spectraRendering}
      >
        <defs>
          <clipPath id={`${displayerKey}clip-chart-1d`}>
            <rect
              width={innerWidth}
              height={innerHeight}
              x={margin.left}
              y="0"
            />
          </clipPath>
        </defs>
        <LinesSeries />
        <ApodizationLine />
        <IntegralsSeries />
        <Peaks peaksSource="peaks" />
        <RangesIntegrals />
        <Ranges />
        <Peaks peaksSource="ranges" />
        <JGraph />
        <MultiAnalysisRanges />
        <BaseLineZones />
        <ExclusionZonesAnnotations />
        <DatabaseElements />
        <PeaksShapes />
        <SpectraTracker />
        <SpectrumInfoBlock />
        <g className="container" style={{ pointerEvents: 'none' }}>
          <XAxis showGrid mode={mode} />
        </g>
      </svg>
    </PeakEditionProvider>
  );
}

export default Chart1D;
