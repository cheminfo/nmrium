import React, { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';

import Integral from './Integral';

const Integrals = () => {
  const { data } = useChartData();

  const _data = useMemo(() => {
    return data
      ? data.filter(
          (d) => d.info.dimension === 2 && d.display.isVisible === true,
        )
      : [];
  }, [data]);
  return (
    <g clipPath="url(#clip)" className="2D-Integrals">
      {_data.map((d) => (
        <g key={d.id}>
          {d.integrals.values.map((integral) => (
            <Integral key={integral.id} {...integral} />
          ))}
        </g>
      ))}
    </g>
  );
};

export default Integrals;
