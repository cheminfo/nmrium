import get from 'lodash/get';
import { xyReduce } from 'ml-spectra-processing';
import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';
import { useScale } from '../context/ScaleContext';

function Line({ x, y, id, display, index }) {
  const { xDomain, activeSpectrum, verticalAlign } = useChartData();
  const preferences = usePreferences();
  const { scaleX, scaleY } = useScale();

  const isActive = useMemo(() => {
    return activeSpectrum === null
      ? true
      : id === activeSpectrum.id
      ? true
      : false;
  }, [activeSpectrum, id]);

  const vAlign = useMemo(() => {
    return verticalAlign.flag
      ? verticalAlign.stacked
        ? index * verticalAlign.value
        : 0
      : verticalAlign.value;
  }, [index, verticalAlign.flag, verticalAlign.stacked, verticalAlign.value]);

  const paths = useMemo(() => {
    const _scaleX = scaleX();
    const _scaleY = scaleY(id);
    if (x && y && _scaleX(0)) {
      const pathPoints = xyReduce(
        { x, y },
        {
          from: xDomain[0],
          to: xDomain[1],
        },
      );

      let path = `M ${_scaleX(pathPoints.x[0])} ${_scaleY(pathPoints.y[0])} `;
      path += pathPoints.x.slice(1).reduce((accumulator, point, i) => {
        accumulator += ` L ${_scaleX(point)} ${_scaleY(pathPoints.y[i + 1])}`;
        return accumulator;
      }, '');
      return path;
    } else {
      return '';
    }
  }, [id, scaleX, scaleY, x, xDomain, y]);

  return (
    <path
      className="line"
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
