import get from 'lodash/get';
import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';

import { get2DXScale, get2DYScale } from './utilities/scale';

function ContoursPaths({ id: spectrumID, sign, color }) {
  const {
    margin,
    width,
    height,
    xDomain,
    yDomain,
    contours,
    activeSpectrum,
  } = useChartData();

  const preferences = usePreferences();

  const isActive = useMemo(() => {
    return activeSpectrum === null
      ? true
      : spectrumID === activeSpectrum.id
      ? true
      : false;
  }, [activeSpectrum, spectrumID]);

  function buildContourPath(data) {
    const _scaleX = get2DXScale({ margin, width, xDomain });
    const _scaleY = get2DYScale({ margin, height, yDomain });
    let path = '';
    const dataLength = data.length;
    for (let i = 1; i < dataLength; i++) {
      path += ` M ${_scaleX(data[i][0].x)} ${_scaleY(data[i][0].y)} `;
      const contursLength = data[i].length;
      for (let j = 1; j < contursLength; j++) {
        path += ` L ${_scaleX(data[i][j].x)} ${_scaleY(data[i][j].y)} `;
      }
    }
    path += ' z';

    return path;
  }
  const data = useMemo(() => {
    return get(contours, `${spectrumID}.${sign}`, []);
  }, [contours, sign, spectrumID]);
  return (
    <path
      fill="none"
      stroke={color}
      strokeWidth="1"
      style={{
        opacity: isActive
          ? 1
          : get(preferences, 'controllers.dimmedSpectraTransparency', 0.1),
      }}
      d={buildContourPath(data)}
    />
  );
}

function Contours() {
  const { data, displayerKey } = useChartData();

  return (
    <g clipPath={`url(#${displayerKey}clip-chart-2d)`} className="contours">
      {data
        .filter((datum) => datum.info.dimension === 2)
        .map((datum, index) => (
          <g key={`${datum.id + index}`}>
            {datum.display.isPositiveVisible && (
              <ContoursPaths
                id={datum.id}
                sign="positive"
                color={datum.display.positiveColor}
              />
            )}
            {datum.display.isNegativeVisible && (
              <ContoursPaths
                id={datum.id}
                sign="negative"
                color={datum.display.negativeColor}
              />
            )}
          </g>
        ))}
    </g>
  );
}

export default Contours;
