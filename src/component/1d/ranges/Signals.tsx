import { isSpectrum1D } from '@zakodium/nmrium-core';

import { Signals1D } from '../../1d-2d/components/Signals1D.tsx';
import { useChartData } from '../../context/ChartContext.tsx';
import { useScaleChecked } from '../../context/ScaleContext.tsx';
import useSpectrum from '../../hooks/useSpectrum.ts';

export function Signals() {
  const spectrum = useSpectrum();
  const { scaleX } = useScaleChecked();
  const { height, margin } = useChartData();

  if (!isSpectrum1D(spectrum)) return null;

  const {
    id,
    ranges: { values },
  } = spectrum;
  return (
    <Signals1D
      orientation="horizontal"
      spectrumId={id}
      ranges={values}
      scale={scaleX()}
      position={height - margin.bottom}
    />
  );
}
