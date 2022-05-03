import { useRef } from 'react';

import { RootProvider } from '../context/RootContext';
import FloatMoleculeStructures from '../tool/FloatMoleculeStructures';

import ExclusionZonesAnnotations from './ExclusionZonesAnnotations';
import IntegralsSeries from './IntegralsSeries';
import LinesSeries from './LinesSeries';
import PeakAnnotations from './PeakAnnotations';
import ResurrectedDatabaseRanges from './ResurrectedDatabaseRanges';
import XAxis from './XAxis';
import JGraph from './jCouplingGraph/JGraph';
import MultiAnalysisRanges from './multiAnalysis/MultiAnalysisRanges';
import Ranges from './ranges/Ranges';
import BaseLineZones from './tool/BaseLineZones';

function Chart1D({ mode, width, height, margin, displayerKey }) {
  const SVGRef = useRef(null);
  return (
    <RootProvider value={SVGRef.current}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        id="nmrSVG"
        ref={SVGRef}
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
        <ExclusionZonesAnnotations />
        <ResurrectedDatabaseRanges />

        <g className="container" style={{ pointerEvents: 'none' }}>
          <XAxis showGrid mode={mode} />
        </g>
        <FloatMoleculeStructures />
      </svg>
    </RootProvider>
  );
}

export default Chart1D;
