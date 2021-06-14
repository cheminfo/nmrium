import max from 'ml-array-max';
import { useContext, useEffect, useState } from 'react';

import { Datum1D } from '../../../data/data1d/Spectrum1D';
import { BrushContext } from '../../EventsTrackers/BrushTracker';
import { MouseContext } from '../../EventsTrackers/MouseTracker';
import { useChartData } from '../../context/ChartContext';
import { useScale } from '../../context/ScaleContext';
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
    activeSpectrum,
    data,
    mode,
    toolOptions: { selectedTool },
    verticalAlign,
  } = useChartData();
  const { scaleX, scaleY } = useScale();

  let position = useContext(MouseContext);
  const brushState = useContext(BrushContext);
  const [closePeakPosition, setPosition] = useState<PeakPosition | null>();

  useEffect(() => {
    function getVerticalAlign() {
      if (activeSpectrum) {
        return verticalAlign.flag
          ? verticalAlign.stacked
            ? activeSpectrum.index * verticalAlign.value
            : 0
          : 0;
      }
      return 0;
    }

    const getClosePeak = (xShift, mouseCoordinates) => {
      if (
        activeSpectrum &&
        position &&
        selectedTool === options.peakPicking.id
      ) {
        const range = [
          scaleX().invert(mouseCoordinates.x - xShift),
          scaleX().invert(mouseCoordinates.x + xShift),
        ].sort(function (a, b) {
          return a - b;
        });

        //get the active sepectrum data by looking for it by id
        const spectrumData = data.find(
          (d) => d.id === activeSpectrum.id,
        ) as Datum1D;

        if (!spectrumData) throw new Error('Unreachable');

        const maxIndex =
          spectrumData.data.x.findIndex((number) => number >= range[1]) - 1;
        const minIndex = spectrumData.data.x.findIndex(
          (number) => number >= range[0],
        );

        const yDataRange = spectrumData.data.y.slice(minIndex, maxIndex);
        if (yDataRange && yDataRange.length > 0) {
          const yValue = max(yDataRange);
          const xIndex = yDataRange.findIndex((value) => value === yValue);
          const xValue = spectrumData.data.x[minIndex + xIndex];
          return {
            x: scaleX()(xValue),
            y: scaleY(activeSpectrum.id)(yValue) - getVerticalAlign(),
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
    data,
    mode,
    position,
    scaleX,
    scaleY,
    selectedTool,
    verticalAlign,
  ]);

  if (
    selectedTool !== options.peakPicking.id ||
    !closePeakPosition ||
    !activeSpectrum ||
    brushState.step === 'brushing' ||
    !position ||
    position.y < margin.top ||
    position.left < margin.left ||
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
