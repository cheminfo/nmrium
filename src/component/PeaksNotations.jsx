import React, { useMemo } from 'react';

import { getPeakLabelNumberDecimals } from '../data/defaults/default';

import { useChartData } from './context/ChartContext';
import PeakNotation from './Notations/PeakNotation';
// import ModifiedPeakNotation from './Notations/ModifiedPeakNotation';

const PeaksNotations = () => {
  const { getScale, data, activeSpectrum, verticalAlign } = useChartData();

  const Peaks = useMemo(() => {
    const getVerticalAlign = (id) => {
      const i = data.findIndex((d) => d.id === id);
      return verticalAlign.flag
        ? verticalAlign.stacked
          ? (i + 1) * verticalAlign.value
          : 0
        : verticalAlign.value;
    };

    const reSortData = () => {
      const _data = [...data];
      return activeSpectrum
        ? _data.sort(function(x, y) {
            return x.id === activeSpectrum.id
              ? 1
              : y.id === activeSpectrum.id
              ? -1
              : 0;
          })
        : _data;
    };

    return (
      data &&
      reSortData()
        .filter((d) => d.isVisible === true)
        .map((d) => {
          return (
            d.peaks &&
            d.peaks.values &&
            d.isPeaksMarkersVisible && (
              <g
                key={d.id}
                transform={`translate(0,-${getVerticalAlign(d.id)})`}
              >
                {d.peaks.values.map(({ xIndex, xShift, id }) => (
                  <PeakNotation
                    key={id}
                    x={getScale(d.id).x(d.x[xIndex] - xShift)}
                    y={getScale(d.id).y(d.y[xIndex]) - 5}
                    // verticalAlign.value
                    xIndex={xIndex}
                    id={id}
                    spectrumID={d.id}
                    value={d.x[xIndex]}
                    // {d.color}
                    color="#730000"
                    decimalFraction={getPeakLabelNumberDecimals(d.info.nucleus)}
                    isActive={
                      activeSpectrum == null
                        ? false
                        : activeSpectrum.id === d.id
                        ? true
                        : false
                    }
                  />
                ))}
              </g>
            )
          );
        })
    );
  }, [data, activeSpectrum, getScale, verticalAlign]);

  return (
    <g className="peaks" clipPath="url(#clip)">
      {Peaks}
    </g>
  );
};

export default PeaksNotations;
