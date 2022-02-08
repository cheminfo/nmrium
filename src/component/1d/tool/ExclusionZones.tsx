import { useChartData } from '../../context/ChartContext';

import ExclusionZone from './ExclusionZone';

export default function ExclusionZones() {
  const {
    toolOptions: {
      data: { exclusionZones },
    },
  } = useChartData();

  if (!exclusionZones) return null;

  return (
    <g className="temp-exclusion-zones-group">
      {exclusionZones.map((zone) => (
        <ExclusionZone key={zone.id} zone={zone} />
      ))}
    </g>
  );
}
