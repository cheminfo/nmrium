import { get1DDataXY } from '../../data/data1d/Spectrum1D/get1DDataXY';
import { useChartData } from '../context/ChartContext';
import { useActiveSpectra } from '../hooks/useActiveSpectra';

import Line from './Line';

function LinesSeries() {
  const { data, tempData, displayerKey, xDomains } = useChartData();
  const activeSpectra = useActiveSpectra();
  let _data = tempData || data;

  return (
    <g clipPath={`url(#${displayerKey}clip-chart-1d)`} className="spectrums">
      {_data
        ?.filter((d) => d.display.isVisible === true && xDomains[d.id])
        .map((d, i) => (
          <g key={d.id} id={d.id}>
            <Line
              display={d.display}
              id={d.id}
              data={get1DDataXY(d)}
              index={i}
            />
          </g>
        ))}

      {activeSpectra?.map((activeSpectrum) => (
        <use key={activeSpectrum.id} href={`#${activeSpectrum.id}`} />
      ))}
    </g>
  );
}

export default LinesSeries;
