import { memo } from 'react';

import {
  Datum2D,
  Display2D,
  Zones as ZonesProps,
} from '../../../data/types/data2d';
import { useChartData } from '../../context/ChartContext';
import { useActiveSpectrum2DViewState } from '../../hooks/useActiveSpectrum2DViewState';
import useSpectrum from '../../hooks/useSpectrum';
import { ZonesViewState } from '../../reducer/Reducer';
import Zone from './Zone';

interface ZonesInnerProps {
  zones: ZonesProps;
  display: Display2D;
  displayerKey: string;
  zonesViewState: ZonesViewState;
}

function ZonesInner({
  zones,
  display,
  displayerKey,
  zonesViewState,
}: ZonesInnerProps) {
  return (
    <g clipPath={`url(#${displayerKey}clip-chart-2d)`} className="2D-Zones">
      {display.isVisible &&
        zones.values.map((zone) => (
          <g className="zone" key={zone.id}>
            <Zone zoneData={zone} zonesViewState={zonesViewState} />
          </g>
        ))}
    </g>
  );
}

const MemoizedZones = memo(ZonesInner);

const emptyData = { zones: {}, display: {} };

export default function Zones() {
  const { displayerKey } = useChartData();

  const { zones, display } = useSpectrum(emptyData) as Datum2D;
  const { zones: zonesViewState } = useActiveSpectrum2DViewState();

  return (
    <MemoizedZones {...{ zones, display, displayerKey, zonesViewState }} />
  );
}
