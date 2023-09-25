import { Spectrum2D } from 'nmr-load-save';

import { getSlice } from '../../../../data/data2d/Spectrum2D';
import { useMouseTracker } from '../../../EventsTrackers/MouseTracker';
import { useChartData } from '../../../context/ChartContext';
import { useActiveSpectrum } from '../../../hooks/useActiveSpectrum';
import { useScale2DX, useScale2DY } from '../../utilities/scale';

import { SpectrumPhaseTrace } from './SpectrumPhaseTrace';
import { useActivePhaseTraces } from './useActivePhaseTraces';

export function PhaseTraceWithMouse() {
  const { width, height, data: spectra } = useChartData();
  const activeSpectrum = useActiveSpectrum();
  const { activeTraceDirection, color } = useActivePhaseTraces();
  const position = useMouseTracker();

  const scale2dX = useScale2DX();
  const scale2dY = useScale2DY();

  if (!position || !width || !height || !activeSpectrum?.id) {
    return null;
  }
  const spectrum = spectra[activeSpectrum.index] as Spectrum2D;

  const sliceData = getSlice(spectrum, {
    x: scale2dX.invert(position.x),
    y: scale2dY.invert(position.y),
  });

  const data = sliceData?.[activeTraceDirection]?.data;
  if (!data) {
    return null;
  }

  return (
    <SpectrumPhaseTrace
      data={data}
      position={position}
      color={color}
      direction={activeTraceDirection}
    />
  );
}
