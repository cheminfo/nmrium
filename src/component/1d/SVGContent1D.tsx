import { ClipPathContainer } from '../1d-2d/components/ClipPathContainer.js';
import SpectrumInfoBlock from '../1d-2d/components/SpectrumInfoBlock.js';
import { ShareDataProvider } from '../context/ShareDataContext.js';

import { ApodizationLine } from './ApodizationLine.js';
import ExclusionZonesAnnotations from './ExclusionZonesAnnotations.js';
import { HorizontalAxis1D } from './HorizontalAxis1D.tsx';
import LinesSeries from './LinesSeries.js';
import { PredictionErrorsNotations } from './PredictionErrorsNotations.js';
import SimilarityTree from './SimilarityTree.js';
import SpectraTracker from './SpectraLegends.js';
import DatabaseElements from './database/DatabaseElements.js';
import IntegralsSeries from './integral/IntegralsSeries.js';
import JGraph from './jCouplingGraph/JGraph.js';
import { Boxplot } from './matrix/Boxplot.js';
import { Stocsy } from './matrix/Stocsy.js';
import MultiAnalysisRanges from './multiAnalysis/MultiAnalysisRanges.js';
import MultiplicityTrees from './multiplicityTree/MultiplicityTrees.js';
import Peaks from './peaks/Peaks.js';
import PeaksShapes from './peaks/PeaksShapes.js';
import Ranges from './ranges/Ranges.js';
import RangesIntegrals from './ranges/RangesIntegrals.js';

export function SVGContent1D() {
  return (
    <g>
      <ClipPathContainer>
        <LinesSeries />
        <ApodizationLine />
        <IntegralsSeries />
        <Peaks peaksSource="peaks" />
        <RangesIntegrals />
        <ShareDataProvider>
          <Ranges />
          <MultiplicityTrees />
        </ShareDataProvider>

        <Peaks peaksSource="ranges" />
        <MultiAnalysisRanges />
        <ExclusionZonesAnnotations />
        <DatabaseElements />
        <PeaksShapes />
        <Stocsy />
        <Boxplot />
        <SpectraTracker />
        <SpectrumInfoBlock />

        <SimilarityTree />
      </ClipPathContainer>
      <JGraph />
      <PredictionErrorsNotations />

      <g className="container" style={{ pointerEvents: 'none' }}>
        <HorizontalAxis1D />
      </g>
    </g>
  );
}
