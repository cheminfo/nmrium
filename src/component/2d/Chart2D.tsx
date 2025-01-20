import type { Spectrum1D } from 'nmr-load-save';
import { memo } from 'react';

import { SVGRootContainer } from '../1d-2d/components/SVGRootContainer.js';
import SpectrumInfoBlock from '../1d-2d/components/SpectrumInfoBlock.js';
import { useChartData } from '../context/ChartContext.js';
import { ShareDataProvider } from '../context/ShareDataContext.js';

import XAxis from './XAxis.js';
import YAxis from './YAxis.js';
import { FidContainer } from './fid/FidContainer.js';
import { FTContainer } from './ft/FTContainer.js';
import IndicationLines from './zones/IndicationLines.js';
import Zones from './zones/Zones.js';
import ZonesAssignmentsLabels from './zones/ZonesAssignmentsLabels.js';

interface Chart2DProps {
  spectra?: Spectrum1D[];
}

function Chart2DInner({ spectra }: Chart2DProps) {
  return (
    <SVGRootContainer enableBoxBorder>
      <FTContainer spectra={spectra} />
      <FidContainer />
      <ShareDataProvider>
        <Zones />
        <ZonesAssignmentsLabels />
      </ShareDataProvider>
      <IndicationLines axis="X" show />
      <IndicationLines axis="Y" show />
      <SpectrumInfoBlock />
      <g className="container" style={{ pointerEvents: 'none' }}>
        <XAxis />
        <YAxis />
      </g>
    </SVGRootContainer>
  );
}

const MemoizedChart2D = memo(Chart2DInner);

export default function Chart2D({ spectra }: Chart2DProps) {
  const { width, height, margin, displayerKey } = useChartData();

  return (
    <MemoizedChart2D {...{ spectra, width, height, margin, displayerKey }} />
  );
}
