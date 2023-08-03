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
import { PeaksGroup } from './peaks/PeaksGroup';
import PeaksShapes from './peaks/PeaksShapes';
import Ranges from './ranges/Ranges';
import BaseLineZones from './tool/BaseLineZones';

function Chart1D({ mode, width, height, margin, displayerKey }) {
  const {
    current: {
      general: { spectraRendering },
    },
  } = usePreferences();
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
              width={`${width - margin.left - margin.right}`}
              height={`${height}`}
              x={`${margin.left}`}
              y={`${0}`}
            />
          </clipPath>
        </defs>
        <LinesSeries />
        <ApodizationLine />
        <IntegralsSeries />
        <PeaksGroup />
        <Ranges />
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
