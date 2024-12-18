import SpectrumInfoBlock from '../1d-2d/components/SpectrumInfoBlock.js';
import { usePreferences } from '../context/PreferencesContext.js';

import { ApodizationLine } from './ApodizationLine.js';
import ExclusionZonesAnnotations from './ExclusionZonesAnnotations.js';
import LinesSeries from './LinesSeries.js';
import SimilarityTree from './SimilarityTree.js';
import SpectraTracker from './SpectraLegends.js';
import XAxis from './XAxis.js';
import DatabaseElements from './database/DatabaseElements.js';
import IntegralsSeries from './integral/IntegralsSeries.js';
import JGraph from './jCouplingGraph/JGraph.js';
import { Boxplot } from './matrix/Boxplot.js';
import { Stocsy } from './matrix/Stocsy.js';
import MultiAnalysisRanges from './multiAnalysis/MultiAnalysisRanges.js';
import MultiplicityTrees from './multiplicityTree/MultiplicityTrees.js';
import { PeakEditionProvider } from './peaks/PeakEditionManager.js';
import Peaks from './peaks/Peaks.js';
import PeaksShapes from './peaks/PeaksShapes.js';
import Ranges from './ranges/Ranges.js';
import RangesIntegrals from './ranges/RangesIntegrals.js';
import BaseLineZones from './tool/BaseLineZones.js';

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
        id="nmrSVG"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fontFamily="Arial, Helvetica, sans-serif"
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
        <MultiplicityTrees />
        <JGraph />
        <MultiAnalysisRanges />
        <BaseLineZones />
        <ExclusionZonesAnnotations />
        <DatabaseElements />
        <PeaksShapes />
        <Stocsy />
        <Boxplot />
        <SpectraTracker />
        <SpectrumInfoBlock />

        <SimilarityTree />
        <g className="container" style={{ pointerEvents: 'none' }}>
          <XAxis showGrid mode={mode} />
        </g>
      </svg>
    </PeakEditionProvider>
  );
}

export default Chart1D;
