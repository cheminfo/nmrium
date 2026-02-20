import debounce from 'lodash/debounce.js';
import { memo, useMemo, useRef } from 'react';

import type { LevelSign } from '../../../data/data2d/Spectrum2D/contours.js';
import { drawContours } from '../../../data/data2d/Spectrum2D/contours.js';
import { useChartData } from '../../context/ChartContext.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import type { SpectrumFTData } from '../../hooks/use2DReducer.tsx';
import { use2DFTSpectra } from '../../hooks/use2DReducer.tsx';
import { useActiveSpectrum } from '../../hooks/useActiveSpectrum.js';
import { PathBuilder } from '../../utility/PathBuilder.js';
import { useScale2DX, useScale2DY } from '../utilities/scale.js';

interface ContoursPathsProps {
  id: string;
  color: string;
  sign: LevelSign;
  spectrum: SpectrumFTData;
  onTimeout: () => void;
}

interface ContoursInnerProps {
  spectra: SpectrumFTData[];
}

function usePath(contours: ReturnType<typeof drawContours>['contours']) {
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

const useContoursLevel = (spectrumID: string, sign: LevelSign) => {
  const {
    view: {
      zoom: { levels },
    },
  } = useChartData();
  const level = levels[spectrumID]?.[sign];
  return level;
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
  const level = useContoursLevel(spectrumID, sign);

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

  const path = usePath(contours);

  const opacity =
    activeSpectrum === null || spectrumID === activeSpectrum.id
      ? '1'
      : // TODO: make sure preferences are not a lie and remove the optional chaining.
        (preferences?.current?.general?.dimmedSpectraOpacity ?? 0.1);

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

function ContoursInner({ spectra }: ContoursInnerProps) {
  const toaster = useToaster();
  const debounceAlert = useRef(
    debounce(() => {
      toaster.show({
        message: 'Too many contour lines, only showing the first ones',
        intent: 'danger',
      });
    }, 2000),
  );

  function timeoutHandler() {
    debounceAlert.current();
  }

  return (
    <g className="contours">
      {spectra?.map((spectrum) => {
        return (
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
        );
      })}
    </g>
  );
}

const MemoizedContours = memo(ContoursInner);

export default function Contours() {
  const spectra = use2DFTSpectra();

  return <MemoizedContours spectra={spectra} />;
}
