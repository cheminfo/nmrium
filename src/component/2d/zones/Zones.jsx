import { useEffect, useState } from 'react';

import ZonesWrapper from '../../hoc/ZonesWrapper';
import Events from '../../utility/Events';

import Zone from './Zone';

const Zones = ({ zones, display, displayerKey }) => {
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
      {(display.isPositiveVisible || display.isNegativeVisible) &&
        zones.values.map((zone) => (
          <g className="zone" key={zone.id}>
            <Zone zoneData={zone} isVisible={isVisible} />
          </g>
        ))}
    </g>
  );
};

export default ZonesWrapper(Zones);
