import debounce from 'lodash/debounce';
import get from 'lodash/get';
import { memo, useMemo, useRef } from 'react';

import { getShift } from '../../data/data2d/Spectrum2D';
import {
  drawContours,
  getDefaultContoursLevel,
  LevelSign,
} from '../../data/data2d/Spectrum2D/contours';
import { Datum2D } from '../../data/types/data2d';
import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';
import { useAlert } from '../elements/popup/Alert';
import { useActiveSpectrum } from '../reducer/Reducer';
import { PathBuilder } from '../utility/PathBuilder';
import nucleusToString from '../utility/nucleusToString';

import { get2DXScale, get2DYScale } from './utilities/scale';

interface ContoursPathsProps {
  id: string;
  color: string;
  sign: LevelSign;
  datum: Datum2D;
  onTimeout: () => void;
}

interface ContoursInnerProps {
  data: Array<Datum2D>;
  displayerKey: string;
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

  return pathBuilder.toString();
}

const useContoursLevel = (datum: Datum2D, sign: LevelSign) => {
  const {
    view: {
      zoom: { levels },
    },
  } = useChartData();
  const {
    id,
    display: { contourOptions },
  } = datum;
  const defaultLevel = getDefaultContoursLevel(contourOptions);
  const level = levels?.[id]?.[sign];
  return isNaN(level) ? defaultLevel[sign] : level;
};

function ContoursPaths({
  id: spectrumID,
  sign,
  color,
  datum,
  onTimeout,
}: ContoursPathsProps) {
  const activeSpectrum = useActiveSpectrum();
  const preferences = usePreferences();

  const level = useContoursLevel(datum, sign);

  const contours = useMemo(() => {
    const { contours, timeout } = drawContours(
      level,
      datum,
      sign === 'negative',
    );
    if (timeout) {
      onTimeout();
    }
    return contours;
  }, [datum, level, onTimeout, sign]);

  const path = usePath(datum, contours);

  const opacity =
    activeSpectrum === null || spectrumID === activeSpectrum.id
      ? '1'
      : get(preferences.current, 'general.dimmedSpectraOpacity', 0.1);

  return (
    <path
      fill="none"
      data-test-id="spectrum-line"
      stroke={color}
      strokeWidth="1"
      opacity={opacity}
      d={path}
    />
  );
}

function ContoursInner({ data, displayerKey }: ContoursInnerProps) {
  const alert = useAlert();
  const debounceAlert = useRef(
    debounce(() => {
      alert.error('Too many contour lines, only showing the first ones');
    }, 2000),
  );

  function timeoutHandler() {
    debounceAlert.current();
  }

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
              onTimeout={timeoutHandler}
            />
          )}
          {datum.display.isNegativeVisible && (
            <ContoursPaths
              id={datum.id}
              sign="negative"
              datum={datum}
              color={datum.display.negativeColor}
              onTimeout={timeoutHandler}
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
    return spectra.filter(
      (datum) =>
        datum.info.dimension === 2 &&
        datum.info.isFt &&
        activeTab === nucleusToString(datum.info.nucleus),
    ) as Array<Datum2D>;
  }, [activeTab, spectra]);

  return <MemoizedContours {...{ data, displayerKey }} />;
}
