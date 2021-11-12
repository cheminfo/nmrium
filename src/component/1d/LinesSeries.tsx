import { useChartData } from '../context/ChartContext';
import get1DDataXY from '../reducer/helper/get1DDataXY';

import Line from './Line';

function LinesSeries() {
  const { data, tempData, displayerKey, xDomains } = useChartData();
  const _data = tempData ? tempData : data;

  return (
    <g clipPath={`url(#${displayerKey}clip-chart-1d)`} className="spectrums">
      {_data
        ?.filter((d) => d.display.isVisible === true && xDomains[d.id])
        .map((d, i) => (
          <Line key={d.id} {...d} data={get1DDataXY(d)} index={i} />
        ))}
    </g>
  );
}

export default LinesSeries;
