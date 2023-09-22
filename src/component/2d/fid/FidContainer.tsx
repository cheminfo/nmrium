import { Spectrum2D } from 'nmr-load-save';

import { getSlice } from '../../../data/data2d/Spectrum2D';
import { useMouseTracker } from '../../EventsTrackers/MouseTracker';
import useSpectrum from '../../hooks/useSpectrum';
import HorizontalSliceChart from '../1d-tracer/HorizontalSliceChart';
import VerticalSliceChart from '../1d-tracer/VerticalSliceChart';
import { useScale2DX, useScale2DY } from '../utilities/scale';

import { FidCanvas } from './FidCanvas';

export function FidContainer() {
  const spectrum = useSpectrum() as Spectrum2D;

  if (!spectrum || spectrum?.info?.isFt) return null;

  return (
    <>
      <TrackerContainer />
      <FidCanvas />
    </>
  );
}

function TrackerContainer() {
  const spectrum = useSpectrum() as Spectrum2D;
  const scale2dX = useScale2DX();
  const scale2dY = useScale2DY();

  const position = useMouseTracker();

  if (!position || !spectrum || spectrum?.info?.isFt) return null;

  const { x, y } = position;
  const data = getSlice(spectrum, {
    x: scale2dX.invert(x),
    y: scale2dY.invert(y),
  });

  if (!data) return null;

  return (
    <g>
      <HorizontalSliceChart data={data.horizontal.data} reverse />
      <VerticalSliceChart data={data.vertical.data} />
    </g>
  );
}
