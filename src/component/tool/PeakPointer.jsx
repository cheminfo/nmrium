import React, { useContext, useEffect, useState } from 'react';
import max from 'ml-array-max';

import { useChartData } from '../context/ChartContext';
import { MouseContext } from '../EventsTrackers/MouseTracker';
import { BrushContext } from '../EventsTrackers/BrushTracker';
import { options } from '../toolbar/ToolTypes';

const styles = {
  radius: 10,
  borderColor: '#1f1f1f',
  strokeWidth: 1,
  fillOpacity: 0,
  SVGPadding: 1,
};

const PeakPointer = () => {
  const {
    height,
    width,
    margin,
    activeSpectrum,
    getScale,
    data,
    mode,
    selectedTool,
    verticalAlign,
  } = useChartData();
  let position = useContext(MouseContext);
  const brushState = useContext(BrushContext);
  const [closePeakPosition, setPosition] = useState();

  useEffect(() => {
    function getVerticalAlign() {
      if (activeSpectrum) {
        return verticalAlign.flag
          ? verticalAlign.stacked
            ? (activeSpectrum.index + 1) * verticalAlign.value
            : 0
          : verticalAlign.value;
      }
      return 0;
    }

    const getClosePeak = (xShift, mouseCoordinates) => {
      if (
        activeSpectrum &&
        position &&
        selectedTool === options.peakPicking.id
      ) {
        const scale = getScale(activeSpectrum.id);

        const range = [
          scale.x.invert(mouseCoordinates.x - xShift),
          scale.x.invert(mouseCoordinates.x + xShift),
        ].sort(function(a, b) {
          return a - b;
        });

        //get the active sepectrum data by looking for it by id
        const spectrumData = data.find((d) => d.id === activeSpectrum.id);

        const maxIndex =
          spectrumData.x.findIndex((number) => number >= range[1]) - 1;
        const minIndex = spectrumData.x.findIndex(
          (number) => number >= range[0],
        );

        const yDataRange = spectrumData.y.slice(minIndex, maxIndex);
        if (yDataRange && yDataRange.length > 0) {
          const yValue = max(yDataRange);
          const xIndex = yDataRange.findIndex((value) => value === yValue);
          const xValue = spectrumData.x[minIndex + xIndex];
          return {
            x: scale.x(xValue),
            // y: scale.y(yValue) - verticalAlign.value,
            y: scale.y(yValue) - getVerticalAlign(),
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
    getScale,
    mode,
    position,
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
};

export default PeakPointer;
