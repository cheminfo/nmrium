import get from 'lodash/get';
import { memo, useLayoutEffect, useMemo, useRef } from 'react';

import { getShift } from '../../data/data2d/Spectrum2D';
import { drawContours } from '../../data/data2d/Spectrum2D/contours';
import { Datum2D } from '../../data/types/data2d';
import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';
import { useActiveSpectrum } from '../reducer/Reducer';
import { PathBuilder } from '../utility/PathBuilder';
import nucleusToString from '../utility/nucleusToString';

import { get2DXScale, get2DYScale } from './utilities/scale';


interface ContoursPathsProps {
  id: string;
  color: string;
  sign: string;
  datum: Datum2D;
}


function usePath(datum: Datum2D, contours) {
  const { margin, width, height, xDomain, yDomain } = useChartData();
  const { xShift, yShift } = getShift(datum);

  const _scaleX = get2DXScale({ margin, width, xDomain });
  const _scaleY = get2DYScale({ margin, height, yDomain });
  const pathBuilder = new PathBuilder();
  for (const element of contours) {
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

  return pathBuilder.toString()

}



function ContoursPaths({
  id: spectrumID,
  sign,
  color,
  datum
}: ContoursPathsProps) {
  const { view: { zoom: { levels } } } = useChartData();
  const pathRef = useRef<SVGPathElement>(null);
  const activeSpectrum = useActiveSpectrum();
  const preferences = usePreferences();

  const level = levels?.[datum.id]?.[sign] || 10;

  useLayoutEffect(() => {
    if (pathRef.current) {
      if (activeSpectrum === null || spectrumID === activeSpectrum.id) {
        pathRef.current.style.opacity = "1";
      } else {
        pathRef.current.style.opacity = get(preferences.current, 'general.dimmedSpectraOpacity', 0.1)
      }
    }
  }, [activeSpectrum, preferences, spectrumID])

  const contours = useMemo(() => {
    return drawContours(level, datum, sign === "negative")
  }, [datum, level, sign]);

  const path = usePath(datum, contours)


  return <path
    ref={pathRef}
    fill="none"
    data-test-id="spectrum-line"
    stroke={color}
    strokeWidth="1"
    d={path}
  />;
}

interface ContoursInnerProps {
  data: Array<Datum2D>;
  displayerKey: string;
}




function ContoursInner({ data, displayerKey }: ContoursInnerProps) {
  return (
    <g clipPath={`url(#${displayerKey}clip-chart-2d)`} className="contours">
      {data?.map((datum) => (
        <g key={datum.id}>
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
  const { data: spectra, displayerKey, view: { spectra: { activeTab } }
  } = useChartData();
  const data = useMemo<Array<Datum2D>>(() => {
    return spectra.filter(
      (datum) => datum.info.dimension === 2 && datum.info.isFt && activeTab === nucleusToString(datum.info.nucleus),
    ) as Array<Datum2D>;
  }, [activeTab, spectra]);

  return <MemoizedContours {...{ data, displayerKey }} />;
}
