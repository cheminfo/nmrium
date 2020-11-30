import { xFindClosestIndex } from 'ml-spectra-processing';
import React, { useContext, useEffect, useMemo, useState } from 'react';

import { MouseContext } from '../EventsTrackers/MouseTracker';
import { useChartData } from '../context/ChartContext';
import { useScale } from '../context/ScaleContext';
import Events from '../utility/Events';

const styles = {
  container: {
    position: 'absolute',
    left: '10px',
    top: '10px',
  },
  value: {
    width: '67px',
    display: 'inline-block',
    margin: '0 5px',
    fontSize: '12px',
  },
  colorIndicator: {
    width: '10px',
    height: '1px',
    borderBottom: `2px solid`,
    display: 'inline-block',
    marginBottom: '3px',
  },
  name: {
    fontSize: '12px',
  },
};

const YTracker = ({ datum }) => {
  const { scaleX } = useScale();
  const position = useContext(MouseContext);

  if (!scaleX || !position) {
    return <span style={styles.value}>{''.padStart(10, '0')}</span>;
  }

  const xIndex = xFindClosestIndex(datum.x, scaleX().invert(position.x));

  return <span style={styles.value}>{datum.y[xIndex]}</span>;
};

const SpectraTracker = () => {
  const { data, activeTab } = useChartData();
  const [isVisible, ToggleVisiblility] = useState(false);

  useEffect(() => {
    Events.on('showYSpectraTrackers', () => {
      ToggleVisiblility((prevState) => !prevState);
    });
  }, []);

  const trackers = useMemo(() => {
    return (
      isVisible &&
      data.map(
        (datum) =>
          datum.display.isVisible &&
          datum.info.nucleus === activeTab && (
            <div style={{ display: 'block' }} key={datum.id}>
              <span
                style={{
                  ...styles.colorIndicator,
                  borderColor: datum.display.color,
                }}
              />
              <YTracker datum={datum} />
              <span style={styles.value}>{datum.display.name}</span>
            </div>
          ),
        [],
      )
    );
  }, [activeTab, data, isVisible]);

  if (!isVisible) return null;

  return <div style={styles.container}>{trackers}</div>;
};

export default SpectraTracker;
