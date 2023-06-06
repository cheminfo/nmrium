import { Spectrum1D } from 'nmr-load-save';

import useSpectrum from '../../hooks/useSpectrum';
import Left1DChart from '../1d-tracer/Left1DChart';
import Top1DChart from '../1d-tracer/Top1DChart';

import Contours from './Contours';

interface FTContainerProps {
  spectra?: Spectrum1D[];
}

export function FTContainer(props: FTContainerProps) {
  const { spectra } = props;

  const activeSpectrum = useSpectrum();

  if (activeSpectrum?.info?.isFid) {
    return null;
  }

  return (
    <>
      {spectra?.[0] && <Top1DChart data={spectra[0]} />}
      {spectra?.[1] && <Left1DChart data={spectra[1]} />}
      <Contours />
    </>
  );
}
