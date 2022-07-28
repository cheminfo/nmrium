import { get1DDataXY } from '../../data/data1d/Spectrum1D/get1DDataXY';
import { useChartData } from '../context/ChartContext';

import Line from './Line';

function LinesSeries() {
  const { data, tempData, displayerKey, xDomains, activeSpectrum } =
    useChartData();
  let _data = tempData ? tempData : data;

  return (
    <g clipPath={`url(#${displayerKey}clip-chart-1d)`} className="spectrums">
      {_data
        ?.filter((d) => d.display.isVisible === true && xDomains[d.id])
        .map((d, i) => (
          <g key={d.id} id={d.id}>
            <Line {...d} data={get1DDataXY(d)} index={i} />
          </g>
        ))}

      {activeSpectrum?.id && <use href={`#${activeSpectrum?.id}`} />}
    </g>
  );
}

export default LinesSeries;
