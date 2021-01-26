import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';
import { useScale } from '../context/ScaleContext';

import PeakNotation from './PeakNotation';

function PeaksNotations() {
  const { data, activeSpectrum, verticalAlign, displayerKey } = useChartData();
  const { scaleX, scaleY } = useScale();

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
        ? _data.sort(function (x, y) {
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
        .filter(
          (d) => d.display.isVisible === true && d.isVisibleInDomain === true,
        )
        .map((d) => {
          return (
            d.peaks &&
            d.peaks.values &&
            d.display.isPeaksMarkersVisible && (
              <g
                key={d.id}
                transform={`translate(0,-${getVerticalAlign(d.id)})`}
              >
                {d.peaks.values.map(({ xIndex, xShift, id }) => (
                  <PeakNotation
                    key={id}
                    x={scaleX()(d.x[xIndex] - (xShift ? xShift : 0))}
                    y={scaleY(d.id)(d.y[xIndex]) - 5}
                    sign={Math.sign(d.y[xIndex])}
                    xIndex={xIndex}
                    id={id}
                    spectrumID={d.id}
                    value={d.x[xIndex]}
                    color="#730000"
                    nucleus={d.info.nucleus}
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
  }, [
    data,
    verticalAlign.flag,
    verticalAlign.stacked,
    verticalAlign.value,
    activeSpectrum,
    scaleX,
    scaleY,
  ]);

  return (
    <g className="peaks" clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      {Peaks}
    </g>
  );
}

export default PeaksNotations;
