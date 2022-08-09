import FloatMoleculeStructures from '../tool/FloatMoleculeStructures';

import ApdoizationLine from './ApodizationLine';
import ExclusionZonesAnnotations from './ExclusionZonesAnnotations';
import IntegralsSeries from './IntegralsSeries';
import LinesSeries from './LinesSeries';
import XAxis from './XAxis';
import DatabaseElements from './database/DatabaseElements';
import JGraph from './jCouplingGraph/JGraph';
import MultiAnalysisRanges from './multiAnalysis/MultiAnalysisRanges';
import PeakAnnotations from './peaks/PeakAnnotations';
import PeaksShapes from './peaks/PeaksShapes';
import Ranges from './ranges/Ranges';
import BaseLineZones from './tool/BaseLineZones';

function Chart1D({ mode, width, height, margin, displayerKey }) {
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
      <ApdoizationLine />
      <IntegralsSeries />
      <PeakAnnotations />
      <Ranges />
      <JGraph />
      <MultiAnalysisRanges />
      <BaseLineZones />
      <ExclusionZonesAnnotations />
      <DatabaseElements />
      <PeaksShapes />

      <g className="container" style={{ pointerEvents: 'none' }}>
        <XAxis showGrid mode={mode} />
      </g>
      <FloatMoleculeStructures />
    </svg>
  );
}

export default Chart1D;
