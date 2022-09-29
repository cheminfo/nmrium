import get from 'lodash/get';
import { memo, useMemo } from 'react';

import { getShift } from '../../../data/data2d/Spectrum2D';
import { Datum2D } from '../../../data/types/data2d';
import { useChartData } from '../../context/ChartContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useActiveSpectrum } from '../../reducer/Reducer';
import { PathBuilder } from '../../utility/PathBuilder';
import { getSpectraByNucleus } from '../../utility/getSpectraByNucleus';
import { get2DXScale, get2DYScale } from '../utilities/scale';

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
  const { margin, width, height, xDomain, yDomain, contours } = useChartData();
  const activeSpectrum = useActiveSpectrum();
  const preferences = usePreferences();
  const { xShift, yShift } = getShift(datum);

  const isActive = useMemo(() => {
    return activeSpectrum === null ? true : spectrumID === activeSpectrum.id;
  }, [activeSpectrum, spectrumID]);

  function buildContourPath(data) {
    const _scaleX = get2DXScale({ margin, width, xDomain });
    const _scaleY = get2DYScale({ margin, height, yDomain });
    const pathBuilder = new PathBuilder();
    for (const element of data) {
      if (element.lines) {
        const lines = element.lines;
        if (lines.length < 1e6) {
          for (let i = 0; i < lines.length; i += 4) {
            pathBuilder.moveTo(
              _scaleX(lines[i] + xShift),
              _scaleY(lines[i + 1] + yShift),
            );
            pathBuilder.lineTo(
              _scaleX(lines[i + 2] + xShift),
              _scaleY(lines[i + 3] + yShift),
            );
          }
        }
      } else {
        pathBuilder.moveTo(
          _scaleX(element[0].x + xShift),
          _scaleY(element[0].y + yShift),
        );

        for (let j = 1; j < element.length; j++) {
          pathBuilder.lineTo(
            _scaleX(element[j].x + xShift),
            _scaleY(element[j].y + yShift),
          );
        }
      }
    }

    pathBuilder.closePath();
    return pathBuilder.toString();
  }

  const data = useMemo(() => {
    return get(contours, `${spectrumID}.${sign}`, []);
  }, [contours, sign, spectrumID]);
  const path = buildContourPath(data);

  if (!path) return null;

  return (
    <path
      fill="none"
      data-test-id="spectrum-line"
      stroke={color}
      strokeWidth="1"
      style={{
        opacity: isActive
          ? 1
          : get(preferences.current, 'general.dimmedSpectraTransparency', 0.1),
      }}
      d={path}
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
  const {
    data: spectra,
    displayerKey,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const data = useMemo<Array<Datum2D>>(() => {
    return getSpectraByNucleus(activeTab, spectra).filter(
      (datum) => datum.info.isFt,
    ) as Array<Datum2D>;
  }, [activeTab, spectra]);

  return <MemoizedContours {...{ data, displayerKey }} />;
}
