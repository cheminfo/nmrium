import lodashGet from 'lodash/get';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { CSSProperties, useContext } from 'react';

import { get1DDataXY } from '../../data/data1d/Spectrum1D/get1DDataXY';
import { Datum1D } from '../../data/types/data1d/index';
import { Datum2D } from '../../data/types/data2d/Datum2D';
import { MouseContext } from '../EventsTrackers/MouseTracker';
import { useChartData } from '../context/ChartContext';
import { useScale } from '../context/ScaleContext';
import { SVGGroup } from '../elements/SVGGroup';
import { usePanelPreferences } from '../hooks/usePanelPreferences';
import { jpathToArray } from '../utility/jpathToArray';
import {
  JpathLegendField,
  legendField,
  PredefinedLegendField,
} from '../workspaces/Workspace';

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
}

function YTracker({ datum }: YTrackerProps) {
  const { scaleX } = useScale();
  const position = useContext(MouseContext);

  if (!scaleX || !position) {
    return null;
  }

  const xIndex = xFindClosestIndex(datum.x, scaleX().invert(position.x));

  return (
    <text style={styles.text} alignmentBaseline="middle">
      {datum.y[xIndex]}
    </text>
  );
}

interface InnerSpectraLegendsProps {
  spectra: (Datum1D | Datum2D)[];
  legendsFields: legendField[];
}

function InnerSpectraLegends({
  spectra,
  legendsFields,
}: InnerSpectraLegendsProps) {
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
          <SVGGroup space={5} style={{ transform: 'translate(12px,0)' }}>
            {legendsFields.map((field) => {
              const predefinedField = field as PredefinedLegendField;

              switch (predefinedField?.name) {
                case 'intensity':
                  return (
                    <g key="intensity">
                      <YTracker datum={get1DDataXY(spectrum as Datum1D)} />
                      <rect width="55" height="1" fill="transparent" />
                    </g>
                  );
                case 'name':
                  return (
                    <text
                      key="name"
                      alignmentBaseline="middle"
                      style={styles.text}
                    >
                      {spectrum.display.name}
                    </text>
                  );
                default: {
                  const jpath = (field as JpathLegendField).jpath;
                  const value = lodashGet(spectrum, jpathToArray(jpath), '');
                  return (
                    <text
                      alignmentBaseline="middle"
                      style={styles.text}
                      key={jpath}
                    >
                      {value}
                    </text>
                  );
                }
              }
            })}
          </SVGGroup>
        </g>
      ))}
    </g>
  );
}

function SpectraLegends() {
  const {
    data,
    view: {
      spectra: { activeTab, showLegend },
    },
    xDomains,
  } = useChartData();

  const { legendsFields } = usePanelPreferences(
    'multipleSpectraAnalysis',
    activeTab,
  );

  if (!showLegend) return null;

  const spectra = data.filter(
    (spectrum) =>
      spectrum.display.isVisible &&
      xDomains[spectrum.id] &&
      spectrum.info.nucleus === activeTab,
  );

  return (
    <InnerSpectraLegends spectra={spectra} legendsFields={legendsFields} />
  );
}

export default SpectraLegends;
