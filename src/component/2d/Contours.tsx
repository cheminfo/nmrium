import get from 'lodash/get';
import { memo, useMemo } from 'react';

import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';
import ContoursWrapper from '../hoc/ContoursWrapper';

import { get2DXScale, get2DYScale } from './utilities/scale';

interface ContoursPathsProps {
  id: string;
  color: string;
  sign: string;
}

function ContoursPaths({ id: spectrumID, sign, color }: ContoursPathsProps) {
  const { margin, width, height, xDomain, yDomain, contours, activeSpectrum } =
    useChartData();

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

    for (const element of data) {
      if (element.lines) {
        const lines = element.lines;
        if (lines.length < 1e6) {
          for (let i = 0; i < lines.length; i += 4) {
            path += `M${_scaleX(lines[i])} ${_scaleY(lines[i + 1])} `;
            path += `L${_scaleX(lines[i + 2])} ${_scaleY(lines[i + 3])} `;
          }
        }
      } else {
        path += `M${_scaleX(element[0].x)} ${_scaleY(element[0].y)} `;
        for (let j = 1; j < element.length; j++) {
          path += `L${_scaleX(element[j].x)} ${_scaleY(element[j].y)} `;
        }
      }
    }

    if (!path) path = 'M0 0 ';
    path += 'Z';

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

interface ContoursData {
  info: { dimension: number };
  id: string;
  display: {
    isPositiveVisible: boolean;
    positiveColor: string;
    isNegativeVisible: boolean;
    negativeColor: string;
  };
}

interface ContoursProps {
  data: Array<ContoursData>;
  displayerKey: string;
}

function Contours({ data, displayerKey }: ContoursProps) {
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

export default ContoursWrapper(memo(Contours));
