import { useMemo } from 'react';

import { isSpectrum1D } from '../../data/data1d/Spectrum1D';
import { useChartData } from '../context/ChartContext';
import { useScaleChecked } from '../context/ScaleContext';

import PeakAnnotation from './PeakAnnotation';
import getVerticalShift from './utilities/getVerticalShift';

function PeakAnnotations() {
  const { data, activeSpectrum, verticalAlign, displayerKey, xDomains } =
    useChartData();
  const { scaleX, scaleY } = useScaleChecked();

  const Peaks = useMemo(() => {
    const getVerticalAlign = (id) => {
      const index = data.findIndex((d) => d.id === id);
      return getVerticalShift(verticalAlign, { index });
    };

    const reSortData = () => {
      const _data = [...data];
      return activeSpectrum
        ? _data.sort((x, y) => {
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
        .filter((d) => d.display.isVisible === true && xDomains[d.id])
        .filter(isSpectrum1D)
        .map((d) => {
          return (
            d.peaks?.values &&
            d.display.isPeaksMarkersVisible && (
              <g
                key={d.id}
                transform={`translate(0,-${getVerticalAlign(d.id)})`}
              >
                {d.peaks.values.map(({ delta, intensity, id }) => (
                  <PeakAnnotation
                    key={id}
                    x={scaleX()(delta)}
                    y={scaleY(d.id)(intensity) - 5}
                    sign={Math.sign(intensity)}
                    id={id}
                    value={delta}
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
  }, [data, verticalAlign, activeSpectrum, xDomains, scaleX, scaleY]);

  return (
    <g className="peaks" clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      {Peaks}
    </g>
  );
}

export default PeakAnnotations;
