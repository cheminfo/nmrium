import PropsTypes from 'prop-types';
import React, { useMemo, useRef, useEffect } from 'react';

import { useChartData } from '../context/ChartContext';

import Contours from './Contours';
import Left1DChart from './Left1DChart';
import Top1DChart from './Top1DChart';
import XAxis from './XAxis';
import YAxis from './YAxis';

function Chart2D({ onDimensionChange }) {
  const {
    width,
    height,
    margin,
    mode,
    tabActiveSpectrum,
    activeTab,
    data,
  } = useChartData();

  const topRef = useRef();
  const leftRef = useRef();
  const centerRef = useRef();
  const spectrumData = useMemo(() => {
    const nucleuses = activeTab.split(',');
    return nucleuses.map((n) => {
      if (tabActiveSpectrum[n] && tabActiveSpectrum[n].id) {
        const id = tabActiveSpectrum[n].id;
        const spectrum = data.find((datum) => datum.id === id);
        return spectrum ? spectrum : [];
      } else {
        return null;
      }
    });

    // }
  }, [activeTab, data, tabActiveSpectrum]);

  const getBoundingClientRect = (element) => {
    const {
      top,
      right,
      bottom,
      left,
      width,
      height,
      x,
      y,
    } = element.getBoundingClientRect();
    return { top, right, bottom, left, width, height, x, y };
  };

  useEffect(() => {
    if (topRef.current && leftRef.current && centerRef.current) {
      const top = getBoundingClientRect(topRef.current);
      const left = getBoundingClientRect(leftRef.current);
      const center = getBoundingClientRect(centerRef.current);

      const dimension = {
        top: { ...top, x: top.x - center.x, y: top.y - center.y },
        left: { ...left, x: left.x - center.x, y: left.y - center.y },
        center: {
          ...center,
          startX: margin.left,
          startY: margin.top,
          endX: center.width - margin.left - margin.right,
          endY: center.height - margin.top - margin.bottom,
        },
      };

      onDimensionChange(dimension);
    }
  }, [
    width,
    height,
    margin.left,
    margin.y,
    margin.right,
    margin.top,
    margin.bottom,
    onDimensionChange,
  ]);

  if (!width || !height || !margin) {
    return null;
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      id="nmrSVG"
      ref={centerRef}
    >
      <defs>
        <clipPath id="clip">
          <rect
            width={width - margin.left - margin.right}
            height={height - margin.top - margin.bottom}
            x={margin.left}
            y={margin.top}
          />
        </clipPath>
      </defs>
      <rect
        width={width - margin.left - margin.right}
        height={height - margin.top - margin.bottom}
        x={margin.left}
        y={margin.top}
        stroke="black"
        strokeWidth="1"
        fill="transparent"
      />
      {spectrumData && spectrumData[0] && (
        <Top1DChart ref={topRef} data={spectrumData[0]} />
      )}
      {spectrumData && spectrumData[1] && (
        <Left1DChart ref={leftRef} data={spectrumData[1]} />
      )}
      <Contours />
      <g className="container" style={{ pointerEvents: 'none' }}>
        <XAxis
          showGrid={true}
          mode={mode}
          margin={{ right: 100, top: 0, left: 0, bottom: 0 }}
        />
        <YAxis show={true} margin={{ right: 50, top: 0, bottom: 0, left: 0 }} />
      </g>
    </svg>
  );
}
Chart2D.defaultProps = {
  onDimensionChange: () => null,
};

Chart2D.propsTypes = {
  onDimensionChange: PropsTypes.func.isRequired,
};

export default Chart2D;
