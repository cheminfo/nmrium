import { useEffect, useState, memo } from 'react';

import {
  Datum2D,
  Display,
  Zones as ZonesProps,
} from '../../../data/data2d/Spectrum2D';
import { useChartData } from '../../context/ChartContext';
import useSpectrum from '../../hooks/useSpectrum';
import Events from '../../utility/Events';

import Zone from './Zone';

interface ZonesInnerProps {
  zones: ZonesProps;
  display: Display;
  displayerKey: string;
}

function ZonesInner({ zones, display, displayerKey }: ZonesInnerProps) {
  const [isVisible, setVisibility] = useState({
    zones: true,
    signals: true,
    peaks: true,
  });
  useEffect(() => {
    Events.on('onZonesVisibilityChange', ({ key }) => {
      setVisibility((prevVisiblity) => ({
        ...prevVisiblity,
        [key]: !prevVisiblity[key],
      }));
    });
  }, []);
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
  const { displayerKey } = useChartData();

  const { zones, display } = useSpectrum(emptyData) as Datum2D;

  return <MemoizedZones {...{ zones, display, displayerKey }} />;
}
