import PropsTypes from 'prop-types';
import { useMemo } from 'react';

import { useMouseTracker } from '../../../EventsTrackers/MouseTracker';
import { useChartData } from '../../../context/ChartContext';
import { AnalysisObj } from '../../../reducer/core/Analysis';
import { get2DXScale, get2DYScale } from '../../utilities/scale';

import HorizontalSliceChart from './HorizontalSliceChart';
import VerticalSliceChart from './VerticalSliceChart';

const SlicingView = () => {
  const {
    width,
    height,
    margin,
    activeSpectrum,
    xDomain,
    yDomain,
  } = useChartData();
  const position = useMouseTracker();

  const chart2d = useMemo(() => {
    if (position && activeSpectrum.id) {
      const { x, y } = position;
      const scale2dX = get2DXScale({ margin, width, xDomain });
      const scale2dY = get2DYScale({ margin, height, yDomain });

      const data = AnalysisObj.createSlice(activeSpectrum.id, {
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
  }, [position, activeSpectrum.id, margin, width, xDomain, height, yDomain]);

  if (!position) {
    return null;
  }

  return chart2d;
};
SlicingView.defaultProps = {
  onDimensionChange: () => null,
};

SlicingView.propsTypes = {
  onDimensionChange: PropsTypes.func.isRequired,
};

export default SlicingView;
