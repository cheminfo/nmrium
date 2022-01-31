import { path } from 'd3';
import get from 'lodash/get';
import { CSSProperties, useMemo } from 'react';

import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';
import { useScaleChecked } from '../context/ScaleContext';
import useXYReduce, { XYReducerDomainAxis } from '../hooks/useXYReduce';

import getVerticalShift from './utilities/getVerticalShift';

interface LineProps {
  data?: {
    x: Array<number>;
    y: Array<number>;
  };
  id: string;
  display: {
    color: CSSProperties['stroke'];
  };
  index: number;
}

function Line({ data, id, display, index }: LineProps) {
  const { activeSpectrum, verticalAlign } = useChartData();
  const preferences = usePreferences();
  const { scaleX, scaleY } = useScaleChecked();
  const xyReduce = useXYReduce(XYReducerDomainAxis.XAxis);
  const isActive = useMemo(() => {
    return activeSpectrum === null
      ? true
      : id === activeSpectrum.id
      ? true
      : false;
  }, [activeSpectrum, id]);

  const vAlign = useMemo(() => {
    return getVerticalShift(verticalAlign, { index });
  }, [index, verticalAlign]);

  const paths = useMemo(() => {
    const _scaleX = scaleX();
    const _scaleY = scaleY(id);
    const pathBuilder = path();

    if (data?.x && data?.y && _scaleX(0)) {
      const pathPoints = xyReduce(data);

      pathBuilder.moveTo(_scaleX(pathPoints.x[0]), _scaleY(pathPoints.y[0]));
      for (let i = 1; i < pathPoints.x.length; i++) {
        pathBuilder.lineTo(_scaleX(pathPoints.x[i]), _scaleY(pathPoints.y[i]));
      }

      return pathBuilder.toString();
    } else {
      return '';
    }
  }, [scaleX, scaleY, id, data, xyReduce]);

  return (
    <path
      className="line"
      data-test-id="spectrum-line"
      key={id}
      stroke={display.color}
      fill="none"
      style={{
        opacity: isActive
          ? 1
          : get(preferences, 'controllers.dimmedSpectraTransparency', 0.1),
      }}
      d={paths}
      transform={`translate(0,-${vAlign})`}
    />
  );
}

export default Line;
