import lodashGet from 'lodash/get';
import { CSSProperties } from 'react';

import { Datum1D } from '../../data/types/data1d/index';
import { Datum2D } from '../../data/types/data2d/Datum2D';
import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';
import { SVGGroup } from '../elements/SVGGroup';
import nucleusToString from '../utility/nucleusToString';

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

function SpectraInfoBlock() {
  const {
    data,
    view: {
      spectra: { activeTab },
    },
    margin,
  } = useChartData();

  const {
    current: {
      infoBlock: { visible, fields },
    },
  } = usePreferences();

  if (!visible) return null;

  const spectra = data.filter(
    (spectrum) =>
      (spectrum.display?.isVisible ||
        (spectrum as Datum2D).display?.isPositiveVisible ||
        (spectrum as Datum2D).display?.isNegativeVisible) &&
      nucleusToString(spectrum.info.nucleus) === activeTab,
  );

  return (
    <g
      className="spectra-info-block"
      transform={`translate(${margin.left + 5} ${margin.top})`}
    >
      {spectra.map((spectrum, index) => (
        <SVGGroup
          transform={`translate(0,${20 * (index + 1)})`}
          space={5}
          key={spectrum.id}
        >
          <rect
            style={{
              ...styles.colorIndicator,
              fill:
                (spectrum as Datum1D).display?.color ||
                (spectrum as Datum2D).display?.positiveColor,
            }}
          />
          {fields
            .filter((field) => field.visible)
            .map((field) => {
              const value = lodashGet(spectrum, field.jpath, '');
              return (
                value && (
                  <text
                    key={field.jpath}
                    alignmentBaseline="middle"
                    style={styles.text}
                  >
                    {lodashGet(spectrum, field.jpath, '')}
                  </text>
                )
              );
            })}
        </SVGGroup>
      ))}
    </g>
  );
}

export default SpectraInfoBlock;
