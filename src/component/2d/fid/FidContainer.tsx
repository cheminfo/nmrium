import { getSlice } from '../../../data/data2d/Spectrum2D';
import { Datum2D } from '../../../data/types/data2d';
import { useMouseTracker } from '../../EventsTrackers/MouseTracker';
import { useChartData } from '../../context/ChartContext';
import useSpectrum from '../../hooks/useSpectrum';
import HorizontalSliceChart from '../1d-tracer/HorizontalSliceChart';
import VerticalSliceChart from '../1d-tracer/VerticalSliceChart';
import { get2DXScale, get2DYScale } from '../utilities/scale';

import { FidCanvas } from './FidCanvas';

export function FidContainer() {
  const spectrum = useSpectrum() as Datum2D;

  if (!spectrum || spectrum?.info?.isFt) return null;

  return (
    <>
      <TrackerContainer />
      <FidCanvas />
    </>
  );
}

function TrackerContainer() {
  const spectrum = useSpectrum() as Datum2D;
  const { margin, width, xDomain, height, yDomain } = useChartData();

  const position = useMouseTracker();

  if (!position || !spectrum || spectrum?.info?.isFt) return null;

  const { x, y } = position;
  const scale2dX = get2DXScale({ margin, width, xDomain });
  const scale2dY = get2DYScale({ margin, height, yDomain });
  const data = getSlice(spectrum, {
    x: scale2dX.invert(x),
    y: scale2dY.invert(y),
  });

  if (!data) return null;

  return (
    <g>
      <HorizontalSliceChart data={data.horizontal.data} reverseScale />
      <VerticalSliceChart data={data.vertical.data} reverseScale />
    </g>
  );
}
