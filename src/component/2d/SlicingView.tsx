import { Spectrum2D } from 'nmr-load-save';

import { getSlice } from '../../data/data2d/Spectrum2D';
import { useMouseTracker } from '../EventsTrackers/MouseTracker';
import { useChartData } from '../context/ChartContext';
import { useActiveSpectrum } from '../hooks/useActiveSpectrum';

import HorizontalSliceChart from './1d-tracer/HorizontalSliceChart';
import VerticalSliceChart from './1d-tracer/VerticalSliceChart';
import { useScale2DX, useScale2DY } from './utilities/scale';

function SlicingView() {
  const { width, height, margin, data: spectra } = useChartData();
  const position = useMouseTracker();
  const activeSpectrum = useActiveSpectrum();
  const scale2dX = useScale2DX();
  const scale2dY = useScale2DY();

  if (!position || !activeSpectrum?.id) {
    return null;
  }

  let { x, y } = position;

  if (x - margin.left < 0) {
    x = 0;
  } else if (y - margin.top < 0) {
    y = 0;
  }
  const data = getSlice(spectra[activeSpectrum.index] as Spectrum2D, {
    x: scale2dX.invert(x),
    y: scale2dY.invert(y),
  });
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        zIndex: 1,
        backgroundColor: 'rgba(255,255,255,0.8)',
      }}
    >
      {data?.horizontal && <HorizontalSliceChart data={data.horizontal.data} />}
      {data?.vertical && <VerticalSliceChart data={data.vertical.data} />}
    </svg>
  );
}

export default SlicingView;
