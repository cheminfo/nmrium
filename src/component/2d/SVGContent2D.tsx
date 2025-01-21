import type { Spectrum1D } from 'nmr-load-save';

import SpectrumInfoBlock from '../1d-2d/components/SpectrumInfoBlock.js';
import { ShareDataProvider } from '../context/ShareDataContext.js';

import XAxis from './XAxis.js';
import YAxis from './YAxis.js';
import { FidContainer } from './fid/FidContainer.js';
import { FTContainer } from './ft/FTContainer.js';
import { useTracesSpectra } from './useTracesSpectra.js';
import IndicationLines from './zones/IndicationLines.js';
import Zones from './zones/Zones.js';
import ZonesAssignmentsLabels from './zones/ZonesAssignmentsLabels.js';

interface Chart2DProps {
  spectra?: Spectrum1D[];
}

export function SVGContent2D({ spectra }: Chart2DProps) {
  return (
    <>
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
    </>
  );
}

export function SVGContent2DWithSpectra() {
  const spectra = useTracesSpectra();
  return <SVGContent2D spectra={spectra} />;
}
