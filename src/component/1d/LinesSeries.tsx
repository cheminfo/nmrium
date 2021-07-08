import { useChartData } from '../context/ChartContext';

import Line from './Line';

function LinesSeries() {
  const { data, tempData, displayerKey, xDomains } = useChartData();
  const _data = tempData ? tempData : data;

  return (
    <g clipPath={`url(#${displayerKey}clip-chart-1d)`} className="spectrums">
      {_data
        ?.filter((d) => d.display.isVisible === true && xDomains[d.id])
        .map((d, i) => (
          <Line key={d.id} {...d} index={i} />
        ))}
    </g>
  );
}

export default LinesSeries;
