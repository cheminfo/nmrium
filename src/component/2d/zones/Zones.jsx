import { useMemo } from 'react';

import { useChartData } from '../../context/ChartContext';

import Zone from './Zone';

const Zones = () => {
  const { data, activeTab } = useChartData();
  const _data = useMemo(() => {
    return data
      ? data.filter(
          (d) =>
            d.info.dimension === 2 &&
            d.info.nucleus.join(',') === activeTab &&
            (d.display.isPositiveVisible || d.display.isNegativeVisible),
        )
      : [];
  }, [activeTab, data]);

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
