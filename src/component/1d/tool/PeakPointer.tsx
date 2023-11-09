import max from 'ml-array-max';
import { Spectrum1D } from 'nmr-load-save';
import { useEffect, useState } from 'react';

import { get1DDataXY } from '../../../data/data1d/Spectrum1D/get1DDataXY';
import { useBrushTracker } from '../../EventsTrackers/BrushTracker';
import { useMouseTracker } from '../../EventsTrackers/MouseTracker';
import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { useActiveSpectrum } from '../../hooks/useActiveSpectrum';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus';
import { options } from '../../toolbar/ToolTypes';

const styles = {
  radius: 10,
  borderColor: '#1f1f1f',
  strokeWidth: 1,
  fillOpacity: 0,
  SVGPadding: 1,
};

interface PeakPosition {
  x: number;
  y: number;
  xIndex: number;
}

function PeakPointer() {
  const {
    height,
    width,
    margin,
    mode,
    toolOptions: { selectedTool },
  } = useChartData();
  const { scaleX, scaleY, shiftY } = useScaleChecked();

  const activeSpectrum = useActiveSpectrum();
  const spectra = useSpectraByActiveNucleus();
  const position = useMouseTracker();
  const brushState = useBrushTracker();
  const [closePeakPosition, setPosition] = useState<PeakPosition | null>();

  useEffect(() => {
    const getClosePeak = (xShift, mouseCoordinates) => {
      if (
        activeSpectrum &&
        position &&
        selectedTool === options.peakPicking.id
      ) {
        const range = [
          scaleX().invert(mouseCoordinates.x - xShift),
          scaleX().invert(mouseCoordinates.x + xShift),
        ].sort((a, b) => {
          return a - b;
        });

        // get the active spectrum data by looking for it by id
        const spectrumIndex = spectra.findIndex(
          (d) => d.id === activeSpectrum.id,
        );

        if (spectrumIndex === -1) throw new Error('Unreachable');

        const datum = get1DDataXY(spectra[spectrumIndex] as Spectrum1D);
        const maxIndex = datum.x.findIndex((number) => number >= range[1]) - 1;
        const minIndex = datum.x.findIndex((number) => number >= range[0]);

        const yDataRange = datum.y.slice(minIndex, maxIndex);
        if (yDataRange && yDataRange.length > 0) {
          const yValue = max(yDataRange);
          const xIndex = yDataRange.indexOf(yValue);
          const xValue = datum.x[minIndex + xIndex];
          return {
            x: scaleX()(xValue),
            y: scaleY(activeSpectrum.id)(yValue) - spectrumIndex * shiftY,
            xIndex: minIndex + xIndex,
          };
        }
      }
      return null;
    };

    const candidatePeakPosition = getClosePeak(10, position);
    setPosition(candidatePeakPosition);
  }, [
    activeSpectrum,
    mode,
    position,
    scaleX,
    scaleY,
    selectedTool,
    shiftY,
    spectra,
  ]);

  if (
    selectedTool !== options.peakPicking.id ||
    !closePeakPosition ||
    !activeSpectrum ||
    brushState.step === 'brushing' ||
    !position ||
    position.y < margin.top ||
    position.x < margin.left ||
    position.x > width - margin.right ||
    position.y > height - margin.bottom
  ) {
    return null;
  }

  return (
    <div
      key="peakPointer"
      style={{
        cursor: 'crosshair',
        transform: `translate(${closePeakPosition.x}px, ${closePeakPosition.y}px)`,
        transformOrigin: 'top left',
        position: 'absolute',
        top: -(styles.radius + styles.SVGPadding),
        left: -(styles.radius + styles.SVGPadding),
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <svg
        width={styles.radius * 2 + styles.SVGPadding * 2}
        height={styles.radius * 2 + styles.SVGPadding * 2}
      >
        <circle
          cx={styles.radius + styles.SVGPadding}
          cy={styles.radius + styles.SVGPadding}
          r={styles.radius}
          stroke={styles.borderColor}
          strokeWidth={styles.strokeWidth}
          fillOpacity={styles.fillOpacity}
        />
        <line
          x1={styles.radius + styles.SVGPadding}
          y1={styles.SVGPadding}
          x2={styles.radius + styles.SVGPadding}
          y2={styles.radius * 2 + styles.SVGPadding}
          stroke={styles.borderColor}
          strokeWidth={styles.strokeWidth}
        />
        <line
          x1={styles.SVGPadding}
          y1={styles.radius + styles.SVGPadding}
          x2={styles.radius * 2 + styles.SVGPadding}
          y2={styles.radius + styles.SVGPadding}
          stroke={styles.borderColor}
          strokeWidth={styles.strokeWidth}
        />
      </svg>
    </div>
  );
}

export default PeakPointer;
