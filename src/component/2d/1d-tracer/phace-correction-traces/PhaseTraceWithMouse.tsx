import { Spectrum2D } from 'nmr-load-save';

import { getSlice } from '../../../../data/data2d/Spectrum2D';
import { useMouseTracker } from '../../../EventsTrackers/MouseTracker';
import { useChartData } from '../../../context/ChartContext';
import { useActiveSpectrum } from '../../../hooks/useActiveSpectrum';
import { get2DXScale, get2DYScale } from '../../utilities/scale';

import { SpectrumPhaseTrace } from './SpectrumPhaseTrace';
import { useActivePhaseTraces } from './useActivePhaseTraces';

export function PhaseTraceWithMouse() {
  const {
    width,
    margin,
    height,
    xDomain,
    data: spectra,
    yDomain,
  } = useChartData();
  const activeSpectrum = useActiveSpectrum();
  const { activeTraceDirection, color } = useActivePhaseTraces();
  const position = useMouseTracker();

  if (!position || !width || !height || !activeSpectrum?.id) {
    return null;
  }
  const spectrum = spectra[activeSpectrum.index] as Spectrum2D;

  const scale2dX = get2DXScale({ margin, width, xDomain });
  const scale2dY = get2DYScale({ margin, height, yDomain });

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
