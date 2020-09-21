import React, { useMemo } from 'react';

import { useChartData } from '../../context/ChartContext';

import Zone from './Zone';

const Zones = () => {
  const { data } = useChartData();
  const _data = useMemo(() => {
    return data
      ? data.filter(
          (d) => d.info.dimension === 2 && d.display.isVisible === true,
        )
      : [];
  }, [data]);

  return (
    <g clipPath="url(#clip)" className="2D-Zones">
      {_data.map((d) => (
        <g key={d.id}>
          {d.zones.values.map((zone) => (
            <g className="zone" key={zone.id}>
              <Zone zoneData={zone} />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
};

export default Zones;
