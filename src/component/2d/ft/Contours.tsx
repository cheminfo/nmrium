import debounce from 'lodash/debounce.js';
import { memo, useMemo, useRef } from 'react';
import { SVGPathBuilder } from 'react-science/ui';

import type { LevelSign } from '../../../data/data2d/Spectrum2D/contours.js';
import { drawContours } from '../../../data/data2d/Spectrum2D/contours.js';
import { getAlignedPoint } from '../../1d-2d/tools/DistanceLine.tsx';
import { useBrushTracker } from '../../EventsTrackers/BrushTracker.tsx';
import { useChartData } from '../../context/ChartContext.js';
import { useKeyModifiers } from '../../context/KeyModifierContext.tsx';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import type { SpectrumFTData } from '../../hooks/use2DReducer.tsx';
import { use2DReducer } from '../../hooks/use2DReducer.tsx';
import { useActiveSpectrum } from '../../hooks/useActiveSpectrum.js';
import { useScale2DX, useScale2DY } from '../utilities/scale.js';

interface SpectrumContoursProps {
  spectrum: SpectrumFTData;
  onTimeout: () => void;
}
interface ContoursPathsProps extends SpectrumContoursProps {
  id: string;
  color: string;
  sign: LevelSign;
}

interface ContoursInnerProps {
  spectra: SpectrumFTData[];
}

function usePath(contours: ReturnType<typeof drawContours>['contours']) {
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();

  const pathBuilder = new SVGPathBuilder();
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
    view: { spectraContourLevels },
  } = useChartData();
  const level = spectraContourLevels[spectrumID]?.[sign];
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

function SpectrumContours(options: SpectrumContoursProps) {
  const { spectrum, onTimeout } = options;
  const {
    id,
    display: {
      positiveColor,
      isPositiveVisible,
      isNegativeVisible,
      negativeColor,
    },
  } = spectrum;
  const { x, y } = useAlignTranslate(id);

  return (
    <g
      style={{
        transform: `translate(${x}px, ${y}px)`,
        willChange: 'transform',
      }}
    >
      {isPositiveVisible && (
        <ContoursPaths
          id={id}
          sign="positive"
          spectrum={spectrum}
          color={positiveColor}
          onTimeout={onTimeout}
        />
      )}
      {isNegativeVisible && (
        <ContoursPaths
          id={id}
          sign="negative"
          spectrum={spectrum}
          color={negativeColor}
          onTimeout={onTimeout}
        />
      )}
    </g>
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
          <SpectrumContours
            key={spectrum.id}
            spectrum={spectrum}
            onTimeout={timeoutHandler}
          />
        );
      })}
    </g>
  );
}

const MemoizedContours = memo(ContoursInner);

export default function Contours() {
  const spectra = use2DReducer();
  return <MemoizedContours spectra={spectra} />;
}

interface Translate {
  x: number;
  y: number;
}

function useAlignTranslate(spectrumId: string): Translate {
  const {
    toolOptions: { selectedTool },
  } = useChartData();
  const { startX, endX, startY, endY, mouseButton } = useBrushTracker();
  const { isPrimary, altKey } = useKeyModifiers();
  const activeSpectrum = useActiveSpectrum();

  if (
    selectedTool !== 'alignTwoDimensionsSpectra' ||
    !isPrimary ||
    mouseButton !== 'main' ||
    activeSpectrum?.id !== spectrumId ||
    endX === 0 ||
    endY === 0
  ) {
    return { x: 0, y: 0 };
  }

  const { x: finalEndX, y: finalEndY } = getAlignedPoint({
    startX,
    startY,
    endX,
    endY,
    altKey,
  });

  const dx = finalEndX - startX;
  const dy = finalEndY - startY;

  return { x: dx, y: dy };
}
