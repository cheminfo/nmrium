import PropsTypes from 'prop-types';
import React, { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';

import Contours from './Contours';
import Left1DChart from './Left1DChart';
import Top1DChart from './Top1DChart';
import XAxis from './XAxis';
import YAxis from './YAxis';

const Chart2D = () => {
  const {
    width,
    height,
    margin,
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

    //   // }
  }, [activeTab, data, tabActiveSpectrum]);

  const chart2d = useMemo(() => {
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        id="nmrSVG"
        // ref={centerRef}
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
          <Top1DChart data={spectrumData[0]} />
        )}
        {spectrumData && spectrumData[1] && (
          <Left1DChart data={spectrumData[1]} />
        )}
        <Contours />
        <g className="container" style={{ pointerEvents: 'none' }}>
          <XAxis />
          <YAxis />
        </g>
      </svg>
    );
  }, [height, margin, spectrumData, width]);

  return chart2d;
};
Chart2D.defaultProps = {
  onDimensionChange: () => null,
};

Chart2D.propsTypes = {
  onDimensionChange: PropsTypes.func.isRequired,
};

export default Chart2D;
