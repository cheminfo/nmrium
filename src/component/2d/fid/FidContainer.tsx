import type { Spectrum2D } from '@zakodium/nmrium-core';

import { getSlice } from '../../../data/data2d/Spectrum2D/index.js';
import { isFt2DSpectrum } from '../../../data/data2d/Spectrum2D/isSpectrum2D.js';
import { useMouseTracker } from '../../EventsTrackers/MouseTracker.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import HorizontalSliceChart from '../1d-tracer/HorizontalSliceChart.js';
import VerticalSliceChart from '../1d-tracer/VerticalSliceChart.js';
import { useScale2DX, useScale2DY } from '../utilities/scale.js';

import { FidCanvas } from './FidCanvas.js';

export function FidContainer() {
  const spectrum = useSpectrum() as Spectrum2D;

  if (!spectrum || isFt2DSpectrum(spectrum)) return null;

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

  if (!position || !spectrum || isFt2DSpectrum(spectrum)) return null;

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
