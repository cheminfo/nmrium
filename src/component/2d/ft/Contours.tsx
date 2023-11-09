import debounce from 'lodash/debounce';
import get from 'lodash/get';
import { Spectrum2D } from 'nmr-load-save';
import { memo, useMemo, useRef } from 'react';

import {
  drawContours,
  getDefaultContoursLevel,
  LevelSign,
} from '../../../data/data2d/Spectrum2D/contours';
import { useChartData } from '../../context/ChartContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useAlert } from '../../elements/popup/Alert';
import { useActiveSpectrum } from '../../hooks/useActiveSpectrum';
import { PathBuilder } from '../../utility/PathBuilder';
import { getSpectraByNucleus } from '../../utility/getSpectraByNucleus';
import { useScale2DX, useScale2DY } from '../utilities/scale';

interface ContoursPathsProps {
  id: string;
  color: string;
  sign: LevelSign;
  spectrum: Spectrum2D;
  onTimeout: () => void;
}

interface ContoursInnerProps {
  spectra: Spectrum2D[];
  displayerKey: string;
}

function usePath(
  spectrum: Spectrum2D,
  contours: ReturnType<typeof drawContours>['contours'],
) {
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();

  const pathBuilder = new PathBuilder();
  for (const element of contours) {
    if (element.lines) {
      const lines = element.lines;
      if (lines.length < 1e6) {
        for (let i = 0; i < lines.length; i += 4) {
          pathBuilder.moveTo(scaleX(lines[i]), scaleY(lines[i + 1]));
          pathBuilder.lineTo(scaleX(lines[i + 2]), scaleY(lines[i + 3]));
        }
      }
    }
  }

  pathBuilder.closePath();

  return pathBuilder.toString();
}

const useContoursLevel = (spectrum: Spectrum2D, sign: LevelSign) => {
  const {
    view: {
      zoom: { levels },
    },
  } = useChartData();
  const {
    id,
    display: { contourOptions },
  } = spectrum;
  const defaultLevel = getDefaultContoursLevel(contourOptions);
  const level = levels?.[id]?.[sign];
  return typeof level !== 'number' ? defaultLevel[sign] : level;
};

function ContoursPaths({
  id: spectrumID,
  sign,
  color,
  spectrum,
  onTimeout,
}: ContoursPathsProps) {
  const activeSpectrum = useActiveSpectrum();
  const preferences = usePreferences();

  const level = useContoursLevel(spectrum, sign);

  const contours = useMemo(() => {
    const { contours, timeout } = drawContours(
      level,
      spectrum,
      sign === 'negative',
    );
    if (timeout) {
      onTimeout();
    }
    return contours;
  }, [spectrum, level, onTimeout, sign]);

  const path = usePath(spectrum, contours);

  const opacity =
    activeSpectrum === null || spectrumID === activeSpectrum.id
      ? '1'
      : get(preferences.current, 'general.dimmedSpectraOpacity', 0.1);

  return (
    <path
      fill="none"
      data-testid="spectrum-line"
      stroke={color}
      strokeWidth="1"
      opacity={opacity}
      d={path}
    />
  );
}

function ContoursInner({ spectra, displayerKey }: ContoursInnerProps) {
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
      {spectra?.map((spectrum) => (
        <g key={spectrum.id}>
          {spectrum.display.isPositiveVisible && (
            <ContoursPaths
              id={spectrum.id}
              sign="positive"
              spectrum={spectrum}
              color={spectrum.display.positiveColor}
              onTimeout={timeoutHandler}
            />
          )}
          {spectrum.display.isNegativeVisible && (
            <ContoursPaths
              id={spectrum.id}
              sign="negative"
              spectrum={spectrum}
              color={spectrum.display.negativeColor}
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
  const spectra2d = useMemo<Spectrum2D[]>(() => {
    return getSpectraByNucleus(activeTab, spectra).filter(
      (datum) => datum.info.isFt,
    ) as Spectrum2D[];
  }, [activeTab, spectra]);

  return <MemoizedContours {...{ spectra: spectra2d, displayerKey }} />;
}
