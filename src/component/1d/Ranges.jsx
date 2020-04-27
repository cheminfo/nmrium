import React, { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';

import Range from './Range';

const Ranges = () => {
  const { data } = useChartData();

  const _data = useMemo(() => {
    return (
      data &&
      data[0] &&
      data.filter(
        (d) => d.display.isVisible === true && d.ranges && d.ranges.values,
      )
    );
  }, [data]);

  return (
    <g clipPath="url(#clip)">
      {_data.map((d) => (
        <g key={d.id}>
          {d.ranges.values.map((range) => (
            <Range key={range.id} rangeData={range} />
          ))}
        </g>
      ))}
    </g>
  );
};

export default Ranges;
