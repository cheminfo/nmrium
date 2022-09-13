import { memo, useMemo } from 'react';

import {
  Datum2D,
  Display2D,
  Zones as ZonesProps,
} from '../../../data/types/data2d';
import { useChartData } from '../../context/ChartContext';
import useSpectrum from '../../hooks/useSpectrum';
import { zoneStateInit } from '../../reducer/Reducer';

import Zone from './Zone';

interface ZonesInnerProps {
  zones: ZonesProps;
  display: Display2D;
  displayerKey: string;
  isVisible: {
    zones: boolean;
    signals: boolean;
    peaks: boolean;
  };
}

function ZonesInner({
  zones,
  display,
  displayerKey,
  isVisible,
}: ZonesInnerProps) {
  return (
    <g clipPath={`url(#${displayerKey}clip-chart-2d)`} className="2D-Zones">
      {display.isVisible &&
        zones.values.map((zone) => (
          <g className="zone" key={zone.id}>
            <Zone zoneData={zone} isVisible={isVisible} />
          </g>
        ))}
    </g>
  );
}

const MemoizedZones = memo(ZonesInner);

const emptyData = { zones: {}, display: {} };

export default function Zones() {
  const {
    displayerKey,
    view: { zones: zoneState },
  } = useChartData();

  const { zones, display, id } = useSpectrum(emptyData) as Datum2D;

  const isVisible = useMemo(() => {
    const { showPeaks, showSignals, showZones } =
      zoneState.find((r) => r.spectrumID === id) || zoneStateInit;
    return {
      zones: showZones,
      signals: showSignals,
      peaks: showPeaks,
    };
  }, [id, zoneState]);

  return <MemoizedZones {...{ zones, display, displayerKey, isVisible }} />;
}
