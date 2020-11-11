import lodash from 'lodash';
import React, { useCallback, useMemo } from 'react';

import { getLabel, getLabels } from '../../../../data/correlation/Utilities';
import EditableColumn from '../../../elements/EditableColumn';

const CorrelationTableRow = ({
  additionalColumns,
  correlations,
  correlation,
  rowKey,
  styleRow,
  styleLabel,
  onSaveEditCount,
}) => {
  const saveHandler = useCallback(
    (e) => {
      onSaveEditCount(correlation, e.target.value);
    },
    [correlation, onSaveEditCount],
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

  return (
    <tr key={rowKey} style={styleRow}>
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
        {onSaveEditCount ? (
          <EditableColumn
            type="number"
            value={correlation.count}
            style={{ padding: '0.4rem' }}
            onSave={saveHandler}
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
