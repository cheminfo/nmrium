import React, { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';

import Contours from './Contours';
import Left1DChart from './Left1DChart';
import Top1DChart from './Top1DChart';
import XAxis from './XAxis';
import YAxis from './YAxis';

function Chart2D() {
  const {
    width,
    height,
    margin,
    mode,
    tabActiveSpectrum,
    activeTab,
    data,
  } = useChartData();

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

  if (!width || !height || !margin) {
    return null;
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      id="nmrSVG"
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
      {spectrumData && spectrumData[0] && <Top1DChart data={spectrumData[0]} />}
      {spectrumData && spectrumData[1] && (
        <Left1DChart data={spectrumData[1]} />
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

export default React.forwardRef(Chart2D);
