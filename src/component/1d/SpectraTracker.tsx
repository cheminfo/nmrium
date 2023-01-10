import { xFindClosestIndex } from 'ml-spectra-processing';
import {
  CSSProperties,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { get1DDataXY } from '../../data/data1d/Spectrum1D/get1DDataXY';
import { Datum1D } from '../../data/types/data1d';
import { Datum2D } from '../../data/types/data2d/Datum2D';
import { MouseContext } from '../EventsTrackers/MouseTracker';
import { useChartData } from '../context/ChartContext';
import { useScale } from '../context/ScaleContext';

const styles: Record<'text' | 'colorIndicator', CSSProperties> = {
  text: {
    fontSize: '12px',
    fill: 'black',
  },
  colorIndicator: {
    width: '10px',
    height: '2px',
  },
};

interface YTrackerProps {
  datum: {
    x: Float64Array;
    y: Float64Array;
  };
  dx: number;
}

function YTracker({ datum, dx }: YTrackerProps) {
  const { scaleX } = useScale();
  const position = useContext(MouseContext);

  if (!scaleX || !position) {
    return null;
  }

  const xIndex = xFindClosestIndex(datum.x, scaleX().invert(position.x));

  return (
    <text
      data-no-export="true"
      transform={`translate(${dx + 20},0)`}
      alignmentBaseline="middle"
      style={styles.text}
    >
      {datum.y[xIndex]}
    </text>
  );
}

function InnerSpectraTracker({ spectra }: { spectra: (Datum1D | Datum2D)[] }) {
  const refs = useRef<(SVGTextElement | null)[]>([]);
  const [maxWidth, setMaxWidth] = useState<number>(0);

  useLayoutEffect(() => {
    let _maxWidth = 0;
    for (const ref of refs.current) {
      const width = ref?.getBBox().width || 0;
      _maxWidth = Math.max(_maxWidth, width);
    }
    setMaxWidth(_maxWidth);
  }, []);

  return (
    <g className="spectra-intensity-legend">
      {spectra.map((spectrum, index) => (
        <g transform={`translate(5,${20 * (index + 1)})`} key={spectrum.id}>
          <rect
            style={{
              ...styles.colorIndicator,
              fill: (spectrum as Datum1D).display.color,
            }}
          />
          <text
            ref={(ref) => {
              refs.current[index] = ref;
            }}
            alignmentBaseline="middle"
            transform="translate(15, 0)"
            style={styles.text}
          >
            {spectrum.display.name}
          </text>
          <YTracker dx={maxWidth} datum={get1DDataXY(spectrum as Datum1D)} />
        </g>
      ))}
    </g>
  );
}

function SpectraTracker() {
  const {
    data,
    view: {
      spectra: { activeTab, showLegend },
    },
    xDomains,
  } = useChartData();

  if (!showLegend) return null;

  const spectra = data.filter(
    (spectrum) =>
      spectrum.display.isVisible &&
      xDomains[spectrum.id] &&
      spectrum.info.nucleus === activeTab,
  );

  return <InnerSpectraTracker spectra={spectra} />;
}

export default SpectraTracker;
