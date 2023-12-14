import lodashGet from 'lodash/get';
import { Spectrum } from 'nmr-load-save';
import { CSSProperties } from 'react';

import { useChartData } from '../../context/ChartContext';
import { usePreferences } from '../../context/PreferencesContext';
import { SVGGroup } from '../../elements/SVGGroup';
import useSpectrum from '../../hooks/useSpectrum';
import { formatNumber } from '../../utility/formatNumber';

const styles: Record<'value' | 'label' | 'colorIndicator', CSSProperties> = {
  label: {
    fontSize: '11px',
    fill: 'black',
    fontWeight: 'bold',
  },
  value: {
    fontSize: '12px',
    fill: 'black',
  },
  colorIndicator: {
    width: '10px',
    height: '2px',
  },
};

function getInfoValue(
  spectrum: Spectrum,
  field: { jpath: string; format: string },
) {
  const { jpath, format } = field;
  const value = lodashGet(spectrum, jpath, '');

  switch (typeof value) {
    case 'number':
      return formatNumber(value, format);
    case 'string':
      return value;
    case 'boolean':
      return value ? 'Yes' : 'No';
    default:
      return JSON.stringify(value);
  }
}

function SpectrumInfoBlock() {
  const { margin } = useChartData();
  const spectrum = useSpectrum();
  const {
    current: {
      infoBlock: { visible, fields },
    },
  } = usePreferences();

  if (!visible || !spectrum) return null;

  return (
    <g
      className="spectra-info-block"
      transform={`translate(${margin.left + 5} ${margin.top})`}
    >
      {fields
        .filter((field) => field.visible)
        .map((field, index) => {
          return (
            <SVGGroup
              transform={`translate(0,${20 * (index + 1)})`}
              space={5}
              key={field.jpath + field.label}
            >
              <text alignmentBaseline="middle" style={styles.label}>
                {field.label} :
              </text>
              <text alignmentBaseline="middle" style={styles.value}>
                {getInfoValue(spectrum, field)}
              </text>
            </SVGGroup>
          );
        })}
    </g>
  );
}

export default SpectrumInfoBlock;
