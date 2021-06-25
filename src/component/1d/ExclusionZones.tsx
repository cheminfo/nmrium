import { useChartData } from '../context/ChartContext';

import ExclusionZone from './ExclusionZone';

export default function ExclusionZones() {
  const {
    toolOptions: {
      data: { exclusionZones },
    },
    activeTab,
  } = useChartData();

  const exclusionZonesForNucleus = exclusionZones[activeTab];

  if (!exclusionZonesForNucleus) return null;

  return (
    <g className="exclusionZones">
      {exclusionZonesForNucleus.map((zone) => (
        <ExclusionZone key={zone.id} zone={zone} />
      ))}
    </g>
  );
}
