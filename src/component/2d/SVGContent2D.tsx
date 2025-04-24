import type { Spectrum1D } from 'nmrium-core';

import { ClipPathContainer } from '../1d-2d/components/ClipPathContainer.js';
import SpectrumInfoBlock from '../1d-2d/components/SpectrumInfoBlock.js';
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

export function SVGContent2D({ spectra }: Chart2DProps) {
  return (
    <g>
      <FTContainer spectra={spectra} />
      <FidContainer />
      <ClipPathContainer>
        <ShareDataProvider>
          <Zones />
          <ZonesAssignmentsLabels />
        </ShareDataProvider>
      </ClipPathContainer>

      <IndicationLines axis="X" show />
      <IndicationLines axis="Y" show />
      <SpectrumInfoBlock />

      <g className="container" style={{ pointerEvents: 'none' }}>
        <XAxis />
        <YAxis />
      </g>
    </g>
  );
}
