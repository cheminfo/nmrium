import get from 'lodash/get';
import { memo, useMemo } from 'react';

import { getShift } from '../../data/data2d/Spectrum2D';
import { Datum2D } from '../../data/types/data2d';
import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';
import { PathBuilder } from '../utility/PathBuilder';

import { get2DXScale, get2DYScale } from './utilities/scale';

interface ContoursPathsProps {
  id: string;
  color: string;
  sign: string;
  datum: Datum2D;
}

function ContoursPaths({
  id: spectrumID,
  sign,
  color,
  datum,
}: ContoursPathsProps) {
  const { margin, width, height, xDomain, yDomain, contours, activeSpectrum } =
    useChartData();

  const preferences = usePreferences();
  const { xShift, yShift } = getShift(datum);

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
    const path = new PathBuilder();

    for (const element of data) {
      if (element.lines) {
        const lines = element.lines;
        if (lines.length < 1e6) {
          for (let i = 0; i < lines.length; i += 4) {
            path.moveTo(
              _scaleX(lines[i] + xShift),
              _scaleY(lines[i + 1] + yShift),
            );
            path.lineTo(
              _scaleX(lines[i + 2] + xShift),
              _scaleY(lines[i + 3] + yShift),
            );
          }
        }
      } else {
        path.moveTo(
          _scaleX(element[0].x + xShift),
          _scaleY(element[0].y + yShift),
        );

        for (let j = 1; j < element.length; j++) {
          path.lineTo(
            _scaleX(element[j].x + xShift),
            _scaleY(element[j].y + yShift),
          );
        }
      }
    }

    path.closePath();
    return path.toString();
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

interface ContoursInnerProps {
  data: Array<Datum2D>;
  displayerKey: string;
}

function ContoursInner({ data, displayerKey }: ContoursInnerProps) {
  return (
    <g clipPath={`url(#${displayerKey}clip-chart-2d)`} className="contours">
      {data?.map((datum, index) => (
        <g key={`${datum.id + index}`}>
          {datum.display.isPositiveVisible && (
            <ContoursPaths
              id={datum.id}
              sign="positive"
              datum={datum}
              color={datum.display.positiveColor}
            />
          )}
          {datum.display.isNegativeVisible && (
            <ContoursPaths
              id={datum.id}
              sign="negative"
              datum={datum}
              color={datum.display.negativeColor}
            />
          )}
        </g>
      ))}
    </g>
  );
}

const MemoizedContours = memo(ContoursInner);

export default function Contours() {
  const { data: spectra, displayerKey } = useChartData();
  const data = useMemo<Array<Datum2D>>(() => {
    return spectra.filter(
      (datum) => datum.info.dimension === 2,
    ) as Array<Datum2D>;
  }, [spectra]);

  // console.log('all', useChartData());

  return <MemoizedContours {...{ data, displayerKey }} />;
}
