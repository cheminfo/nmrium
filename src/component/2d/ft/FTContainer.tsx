import type { Spectrum1D } from 'nmr-load-save';

import { isFt2DSpectrum } from '../../../data/data2d/Spectrum2D/isSpectrum2D.js';
import { ClipPathContainer } from '../../1d-2d/components/ClipPathContainer.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import Left1DChart from '../1d-tracer/Left1DChart.js';
import Top1DChart from '../1d-tracer/Top1DChart.js';

import Contours from './Contours.js';

interface FTContainerProps {
  spectra?: Spectrum1D[];
}

export function FTContainer(props: FTContainerProps) {
  const { spectra } = props;

  const activeSpectrum = useSpectrum();

  if (activeSpectrum && !isFt2DSpectrum(activeSpectrum)) {
    return null;
  }

  return (
    <>
      {spectra?.[0] && <Top1DChart data={spectra[0]} />}
      {spectra?.[1] && <Left1DChart data={spectra[1]} />}
      <ClipPathContainer>
        <Contours />
      </ClipPathContainer>
    </>
  );
}
