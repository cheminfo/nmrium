import BaseLineZones from './BaseLineZones';
import ExclusionZones from './ExclusionZones';
import IntegralsSeries from './IntegralsSeries';
import LinesSeries from './LinesSeries';
import PeakAnnotations from './PeakAnnotations';
import ResurrectedDatabaseRanges from './ResurrectedDatabaseRanges';
import XAxis from './XAxis';
import JGraph from './jCouplingGraph/JGraph';
import MultiAnalysisRanges from './multiAnalysis/MultiAnalysisRanges';
import Ranges from './ranges/Ranges';

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
      <IntegralsSeries />
      <PeakAnnotations />
      <Ranges />
      <JGraph />
      <MultiAnalysisRanges />
      <BaseLineZones />
      <ExclusionZones />
      <ResurrectedDatabaseRanges />

      <g className="container" style={{ pointerEvents: 'none' }}>
        <XAxis showGrid mode={mode} />
      </g>
    </svg>
  );
}

export default Chart1D;
