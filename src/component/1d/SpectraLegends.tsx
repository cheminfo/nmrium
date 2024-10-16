import lodashGet from 'lodash/get.js';
import { xFindClosestIndex } from 'ml-spectra-processing';
import {
  JpathLegendField,
  LegendField,
  PredefinedLegendField,
  Spectrum,
  Spectrum1D,
} from 'nmr-load-save';
import { CSSProperties } from 'react';

import { get1DDataXY } from '../../data/data1d/Spectrum1D/get1DDataXY.js';
import { useMouseTracker } from '../EventsTrackers/MouseTracker.js';
import { useChartData } from '../context/ChartContext.js';
import { useScale } from '../context/ScaleContext.js';
import { SVGGroup } from '../elements/SVGGroup.js';
import { useActiveSpectra } from '../hooks/useActiveSpectra.js';
import { usePanelPreferences } from '../hooks/usePanelPreferences.js';
import { convertPathArrayToString } from '../utility/convertPathArrayToString.js';

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
  const position = useMouseTracker();

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
  spectra: Spectrum[];
  legendsFields: LegendField[];
}

function InnerSpectraLegends({
  spectra,
  legendsFields,
}: InnerSpectraLegendsProps) {
  const visibleLegendsFields = legendsFields.filter((legend) => legend.visible);

  return (
    <g className="spectra-intensity-legend">
      {spectra.map((spectrum, index) => (
        <g transform={`translate(5,${20 * (index + 1)})`} key={spectrum.id}>
          <rect
            style={{
              ...styles.colorIndicator,
              fill: (spectrum as Spectrum1D).display.color,
            }}
          />
          <SVGGroup space={5} transform="translate(12 0)">
            {visibleLegendsFields.map((field) => {
              const { name } = field as PredefinedLegendField;
              switch (name) {
                case 'intensity':
                  return (
                    <g key="intensity">
                      <YTracker datum={get1DDataXY(spectrum as Spectrum1D)} />
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
                      {spectrum.info.name}
                    </text>
                  );
                default: {
                  const jpath = (field as JpathLegendField).jpath;
                  const value = lodashGet(spectrum, jpath, '');
                  return (
                    <text
                      alignmentBaseline="middle"
                      style={styles.text}
                      key={convertPathArrayToString(jpath)}
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

  const selectedSpectra = useActiveSpectra() || [];
  const selectedSpectraIDs = new Set(
    selectedSpectra.map((spectrum) => spectrum.id),
  );

  if (!showLegend) return null;

  const spectra = data.filter(
    (spectrum) =>
      spectrum.display.isVisible &&
      xDomains[spectrum.id] &&
      spectrum.info.nucleus === activeTab &&
      (selectedSpectraIDs.size === 0 || selectedSpectraIDs.has(spectrum.id)),
  );

  return (
    <InnerSpectraLegends spectra={spectra} legendsFields={legendsFields} />
  );
}

export default SpectraLegends;
