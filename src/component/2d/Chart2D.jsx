import React, { useMemo, Fragment } from 'react';

import { useChartData } from '../context/ChartContext';

import XAxis from './XAxis';
import YAxis from './YAxis';
import Top1DChart from './Top1DChart';
import Left1DChart from './Left1DChart';
import Contours from './Contours';

function Chart2D() {
  const {
    width,
    height,
    margin,
    mode,
    xDomains,
    yDomains,
    tabActiveSpectrum,
    activeTab,
    data,
  } = useChartData();

  const spectrumData = useMemo(() => {
    const nucleuses = activeTab.split(',');
    if (
      nucleuses.length === 2 &&
      Object.keys(tabActiveSpectrum).length !== 0 &&
      xDomains &&
      Object.keys(xDomains).length !== 0 &&
      yDomains &&
      Object.keys(yDomains).length !== 0
    ) {
      return nucleuses.map((n) => {
        const id = tabActiveSpectrum[n].id;
        const spectrum = data.find((datum) => datum.id === id);
        return spectrum
          ? { spectrum, xDomain: xDomains[id], yDomain: yDomains[id] }
          : null;
      });
    }

    return null;
  }, [activeTab, data, tabActiveSpectrum, xDomains, yDomains]);

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
      {spectrumData && (
        <Fragment>
          <Top1DChart data={spectrumData[0]} />
          <Left1DChart data={spectrumData[1]} />
        </Fragment>
      )}
      <Contours data={spectrumData} />

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
