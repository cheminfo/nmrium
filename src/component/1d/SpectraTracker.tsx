import { xFindClosestIndex } from 'ml-spectra-processing';
import { CSSProperties, useContext, useEffect, useMemo, useState } from 'react';

import { Datum1D } from '../../data/data1d/Spectrum1D';
import { MouseContext } from '../EventsTrackers/MouseTracker';
import { useChartData } from '../context/ChartContext';
import { useScale } from '../context/ScaleContext';
import Events from '../utility/Events';

const styles: Record<
  'container' | 'value' | 'colorIndicator' | 'name',
  CSSProperties
> = {
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

interface YTrackerProps {
  datum: {
    x: Array<number>;
    y: Array<number>;
  };
}

function YTracker({ datum }: YTrackerProps) {
  const { scaleX } = useScale();
  const position = useContext(MouseContext);

  if (!scaleX || !position) {
    return null;
  }

  const xIndex = xFindClosestIndex(datum.x, scaleX().invert(position.x));

  return <span style={styles.value}>{datum.y[xIndex]}</span>;
}

function SpectraTracker() {
  const { data, activeTab } = useChartData();
  const [isVisible, ToggleVisiblility] = useState(false);

  useEffect(() => {
    function handler(flag) {
      ToggleVisiblility(flag);
    }

    Events.on('showYSpectraTrackers', handler);

    return () => {
      Events.off('showYSpectraTrackers', handler);
    };
  }, []);

  const trackers = useMemo(() => {
    return (
      isVisible &&
      data.map(
        (datum) =>
          datum.display.isVisible &&
          datum.display.isVisibleInDomain &&
          datum.info.nucleus === activeTab && (
            <div style={{ display: 'block' }} key={datum.id}>
              <span
                style={{
                  ...styles.colorIndicator,
                  borderColor: (datum as Datum1D).display.color,
                }}
              />
              <YTracker datum={(datum as Datum1D).data} />
              <span style={styles.value}>{datum.display.name}</span>
            </div>
          ),
        [],
      )
    );
  }, [activeTab, data, isVisible]);

  if (!isVisible) return null;

  return <div style={styles.container}>{trackers}</div>;
}

export default SpectraTracker;
