import { isFt2DSpectrum } from '../../../data/data2d/Spectrum2D/isSpectrum2D.js';
import { ClipPathContainer } from '../../1d-2d/components/ClipPathContainer.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import Left1DChart from '../1d-tracer/Left1DChart.js';
import Top1DChart from '../1d-tracer/Top1DChart.js';
import type { Spectrum1DTraces } from '../useTracesSpectra.js';

import Contours from './Contours.js';

interface FTContainerProps {
  spectra: Spectrum1DTraces;
}

export function FTContainer(props: FTContainerProps) {
  const { spectra } = props;

  const activeSpectrum = useSpectrum();

  if (activeSpectrum && !isFt2DSpectrum(activeSpectrum)) {
    return null;
  }

  return (
    <>
      {spectra.x && <Top1DChart data={spectra.x} />}
      {spectra.y && <Left1DChart data={spectra.y} />}
      <ClipPathContainer>
        <Contours />
      </ClipPathContainer>
    </>
  );
}
