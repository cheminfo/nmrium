import { Display2D, Spectrum2D } from 'nmr-load-save';
import { Zones as ZonesType } from 'nmr-processing';
import { memo } from 'react';

import { useChartData } from '../../context/ChartContext';
import useSpectrum from '../../hooks/useSpectrum';

import Zone from './Zone';

interface ZonesInnerProps {
  zones: ZonesType;
  display: Display2D;
  displayerKey: string;
}

function ZonesInner({ zones, display, displayerKey }: ZonesInnerProps) {
  return (
    <g clipPath={`url(#${displayerKey}clip-chart-2d)`} className="2D-Zones">
      {display.isVisible &&
        zones.values.map((zone) => (
          <g className="zone" key={zone.id}>
            <Zone zoneData={zone} />
          </g>
        ))}
    </g>
  );
}

const MemoizedZones = memo(ZonesInner);

const emptyData = { zones: {}, display: {} };

export default function Zones() {
  const { displayerKey } = useChartData();

  const { zones, display } = useSpectrum(emptyData) as Spectrum2D;
  return <MemoizedZones {...{ zones, display, displayerKey }} />;
}
