import type { Spectrum2D } from '@zakodium/nmrium-core';
import debounce from 'lodash/debounce.js';
import { memo, useMemo, useRef } from 'react';

import type { LevelSign } from '../../../data/data2d/Spectrum2D/contours.js';
import { drawContours } from '../../../data/data2d/Spectrum2D/contours.js';
import { isFt2DSpectrum } from '../../../data/data2d/Spectrum2D/isSpectrum2D.ts';
import { useChartData } from '../../context/ChartContext.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import type { SpectrumData } from '../../hooks/use2DReducer.tsx';
import { use2DReducer } from '../../hooks/use2DReducer.tsx';
import { useActiveSpectrum } from '../../hooks/useActiveSpectrum.js';
import { PathBuilder } from '../../utility/PathBuilder.js';
import { getSpectraByNucleus } from '../../utility/getSpectraByNucleus.js';
import { useScale2DX, useScale2DY } from '../utilities/scale.js';

interface ContoursPathsProps {
  id: string;
  color: string;
  sign: LevelSign;
  spectrum: SpectrumData;
  onTimeout: () => void;
}

interface ContoursInnerProps {
  spectra: Spectrum2D[];
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

const useContoursLevel = (spectrum: SpectrumData, sign: LevelSign) => {
  const {
    display: { contourOptions },
  } = spectrum;
  return contourOptions?.[sign];
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
  const spectraData = use2DReducer(spectra);

  return (
    <g className="contours">
      {spectraData?.map((spectrum) => {
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
  const {
    data: spectra,
    displayerKey,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const spectra2d = useMemo<Spectrum2D[]>(() => {
    return getSpectraByNucleus(activeTab, spectra).filter((datum) =>
      isFt2DSpectrum(datum),
    ) as Spectrum2D[];
  }, [activeTab, spectra]);

  return <MemoizedContours {...{ spectra: spectra2d, displayerKey }} />;
}
