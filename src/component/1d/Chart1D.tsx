import BaseLineZones from './BaseLineZones';
import ExclusionZones from './ExclusionZones';
import IntegralsSeries from './IntegralsSeries';
import LinesSeries from './LinesSeries';
import PeakAnnotations from './PeakAnnotations';
import XAxis from './XAxis';
import MultiAnalysisRanges from './multiAnalysis/MultiAnalysisRanges';
import Ranges from './ranges/Ranges';
import ResurrectedDatabaseRanges from './ResurrectedDatabaseRanges';

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
