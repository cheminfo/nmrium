import lodash from 'lodash';
import { useCallback, useMemo } from 'react';

import { getLabel, getLabels } from '../../../../data/correlation/Utilities';
import EditableColumn from '../../../elements/EditableColumn';
import SelectUncontrolled from '../../../elements/SelectUncontrolled';

import { Hybridizations } from './Constants';

const selectBoxStyle = {
  marginLeft: 2,
  marginRight: 2,
  border: 'none',
  height: '20px',
};

const CorrelationTableRow = ({
  additionalColumns,
  correlations,
  correlation,
  styleRow,
  styleLabel,
  onSaveEditEquivalences,
  onChangeHybridization,
}) => {
  const saveHandler = useCallback(
    (e) => {
      onSaveEditEquivalences(correlation, e.target.value);
    },
    [correlation, onSaveEditEquivalences],
  );

  const additionalColumnsData = useMemo(
    () =>
      additionalColumns.map((experimentType, n) => {
        let content = '';
        const labels = getLabels(correlations, correlation, experimentType);
        if (labels.length > 0) {
          content = labels.join(', ');
        }

        // eslint-disable-next-line react/no-array-index-key
        return <td key={`addCol_${experimentType}_${n}`}>{content}</td>;
      }),
    [additionalColumns, correlation, correlations],
  );

  const onChangeHybridizationHandler = useCallback(
    (value) => {
      onChangeHybridization(correlation, value);
    },
    [correlation, onChangeHybridization],
  );

  return (
    <tr style={styleRow}>
      <td>
        {correlation.getExperimentType()
          ? correlation.getExperimentType().toUpperCase()
          : ''}
      </td>
      <td style={styleLabel}>{getLabel(correlations, correlation)}</td>
      <td>
        {lodash.get(correlation.getSignal(), 'delta', false)
          ? correlation.getSignal().delta.toFixed(3)
          : ''}
      </td>
      <td>
        {onSaveEditEquivalences ? (
          <EditableColumn
            type="number"
            value={
              correlation.getEquivalences() > 0
                ? correlation.getEquivalences()
                : ''
            }
            style={{ padding: '0.4rem' }}
            onSave={saveHandler}
          />
        ) : (
          ''
        )}
      </td>
      <td>{correlation.getProtonsCount()}</td>
      <td>
        {correlation.getAtomType() !== 'H' ? (
          <SelectUncontrolled
            onChange={onChangeHybridizationHandler}
            data={Hybridizations}
            value={correlation.getHybridization()}
            style={{
              ...selectBoxStyle,
              backgroundColor: styleRow.backgroundColor,
            }}
          />
        ) : (
          ''
        )}
      </td>
      {additionalColumnsData}
    </tr>
  );
};

export default CorrelationTableRow;
