import { get1DDataXY } from '../../data/data1d/Spectrum1D/get1DDataXY';
import { useChartData } from '../context/ChartContext';
import { useActiveSpectrum } from '../reducer/Reducer';

import Line from './Line';

function LinesSeries() {
  const { data, tempData, displayerKey, xDomains } = useChartData();
  const activeSpectrum = useActiveSpectrum();
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

      {activeSpectrum?.id && <use href={`#${activeSpectrum?.id}`} />}
    </g>
  );
}

export default LinesSeries;
