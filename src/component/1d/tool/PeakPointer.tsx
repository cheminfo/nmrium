import max from 'ml-array-max';
import { useContext, useEffect, useState } from 'react';

import { get1DDataXY } from '../../../data/data1d/Spectrum1D/get1DDataXY';
import { Datum1D } from '../../../data/types/data1d';
import { BrushContext } from '../../EventsTrackers/BrushTracker';
import { MouseContext } from '../../EventsTrackers/MouseTracker';
import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { useActiveSpectrum } from '../../reducer/Reducer';
import { options } from '../../toolbar/ToolTypes';
import getVerticalShift from '../utilities/getVerticalShift';

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
    data,
    mode,
    toolOptions: { selectedTool },
    verticalAlign,
  } = useChartData();
  const { scaleX, scaleY } = useScaleChecked();

  const activeSpectrum = useActiveSpectrum();
  let position = useContext(MouseContext);
  const brushState = useContext(BrushContext);
  const [closePeakPosition, setPosition] = useState<PeakPosition | null>();

  useEffect(() => {
    const vShift = activeSpectrum
      ? getVerticalShift(verticalAlign, {
          index: activeSpectrum?.index || 1,
          align: 'center',
        })
      : 0;

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

        //get the active sepectrum data by looking for it by id
        const spectrum = data.find(
          (d) => d.id === activeSpectrum.id,
        ) as Datum1D;

        if (!spectrum) throw new Error('Unreachable');
        const datum = get1DDataXY(spectrum);
        const maxIndex = datum.x.findIndex((number) => number >= range[1]) - 1;
        const minIndex = datum.x.findIndex((number) => number >= range[0]);

        const yDataRange = datum.y.slice(minIndex, maxIndex);
        if (yDataRange && yDataRange.length > 0) {
          const yValue = max(yDataRange);
          const xIndex = yDataRange.findIndex((value) => value === yValue);
          const xValue = datum.x[minIndex + xIndex];
          return {
            x: scaleX()(xValue),
            y: scaleY(activeSpectrum.id)(yValue) - vShift,
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
