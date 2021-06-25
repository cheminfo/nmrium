import { useChartData } from '../context/ChartContext';

import Line from './Line';

function LinesSeries() {
  const { data, tempData, displayerKey } = useChartData();
  const _data = tempData ? tempData : data;

  return (
    <g clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      {_data
        ?.filter(
          (d) =>
            d.display.isVisible === true &&
            d.display.isVisibleInDomain === true,
        )
        .map((d, i) => (
          <Line key={d.id} {...d} index={i} />
        ))}
    </g>
  );
}

export default LinesSeries;
