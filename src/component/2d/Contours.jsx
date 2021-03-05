import debounce from 'lodash/debounce';
import get from 'lodash/get';
import { useMemo, useRef } from 'react';

import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';
import { useAlert } from '../elements/popup/Alert';

import { get2DXScale, get2DYScale } from './utilities/scale';

function ContoursPaths({ id: spectrumID, sign, color, showMessage }) {
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
    console.time('build');
    const _scaleX = get2DXScale({ margin, width, xDomain });
    const _scaleY = get2DYScale({ margin, height, yDomain });

    let paths = [];
    let degraded = false;

    for (let i = 0; i < data.length; i++) {
      degraded = data[i].degraded;
      if (data[i].lines) {
        const lines = data[i].lines;
        for (let i = 0; i < lines.length; i += 4) {
          paths.push(`M${_scaleX(lines[i])} ${_scaleY(lines[i + 1])} `);
          paths.push(`L${_scaleX(lines[i + 2])} ${_scaleY(lines[i + 3])} `);
        }
      } else {
        paths.push(`M${_scaleX(data[i][0].x)} ${_scaleY(data[i][0].y)} `);
        for (let j = 1; j < data[i].length; j++) {
          paths.push(`L${_scaleX(data[i][j].x)} ${_scaleY(data[i][j].y)} `);
        }
      }
    }

    if (degraded) showMessage('Too many lines to display');

    if (!paths.length === 0) paths.push('M0 0 ');
    paths.push('Z');
    let result = paths.join('');
    console.timeEnd('build');

    return result;
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
  const alert = useAlert();

  const showMessage = useRef(
    debounce((message) => {
      alert(message);
    }, 1000),
  );

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
                showMessage={showMessage}
              />
            )}
            {datum.display.isNegativeVisible && (
              <ContoursPaths
                id={datum.id}
                sign="negative"
                color={datum.display.negativeColor}
                showMessage={showMessage}
              />
            )}
          </g>
        ))}
    </g>
  );
}

export default Contours;
