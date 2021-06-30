import { useMemo } from 'react';

import { getSlice } from '../../../../data/data2d/Spectrum2D';
import { useMouseTracker } from '../../../EventsTrackers/MouseTracker';
import { useChartData } from '../../../context/ChartContext';
import { get2DXScale, get2DYScale } from '../../utilities/scale';

import HorizontalSliceChart from './HorizontalSliceChart';
import VerticalSliceChart from './VerticalSliceChart';

function SlicingView() {
  const {
    width,
    height,
    margin,
    activeSpectrum,
    data: spectra,
    xDomain,
    yDomain,
  } = useChartData();
  const position = useMouseTracker();

  const chart2d = useMemo(() => {
    if (position && activeSpectrum.id) {
      const { x, y } = position;
      const scale2dX = get2DXScale({ margin, width, xDomain });
      const scale2dY = get2DYScale({ margin, height, yDomain });
      const data = getSlice(spectra[activeSpectrum.index], {
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
            backgroundColor: 'rgba(255,255,255,0.8)',
          }}
        >
          {data && data.horizontal && (
            <HorizontalSliceChart data={data.horizontal.data} />
          )}
          {data && data.vertical && (
            <VerticalSliceChart data={data.vertical.data} />
          )}
        </svg>
      );
    }
    return null;
  }, [
    position,
    activeSpectrum.id,
    activeSpectrum.index,
    margin,
    width,
    xDomain,
    height,
    yDomain,
    spectra,
  ]);

  if (!position) {
    return null;
  }

  return chart2d;
}

export default SlicingView;
