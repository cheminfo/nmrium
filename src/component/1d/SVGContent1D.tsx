import { ClipPathContainer } from '../1d-2d/components/ClipPathContainer.js';
import SpectrumInfoBlock from '../1d-2d/components/SpectrumInfoBlock.js';

import { ApodizationLine } from './ApodizationLine.js';
import ExclusionZonesAnnotations from './ExclusionZonesAnnotations.js';
import LinesSeries from './LinesSeries.js';
import SimilarityTree from './SimilarityTree.js';
import SpectraTracker from './SpectraLegends.js';
import { XAxis1D } from './XAxis1D.js';
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
import BaseLineZones from './tool/BaseLineZones.js';

export function SVGContent1D() {
  return (
    <g>
      <ClipPathContainer>
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
      </ClipPathContainer>

      <g className="container" style={{ pointerEvents: 'none' }}>
        <XAxis1D showGrid />
      </g>
    </g>
  );
}
