import lodash from 'lodash';
import React, { useMemo } from 'react';

import { getLabel, getLabels } from './Utilities';

const CorrelationTableRow = ({
  additionalColumns,
  correlations,
  correlation,
  rowKey,
  styleRow,
  styleLabel,
}) => {
  const additionalColumnsData = useMemo(
    () =>
      additionalColumns.map((experimentType, n) => {
        let content = '';
        if (lodash.get(correlation, 'correlation', false)) {
          const labels = getLabels(correlations, correlation, experimentType);
          if (labels.length > 0) {
            content = labels.join(', ');
          }
        }
        // eslint-disable-next-line react/no-array-index-key
        return <td key={`addCol_${experimentType}_${n}`}>{content}</td>;
      }),
    [additionalColumns, correlation, correlations],
  );

  return (
    <tr key={rowKey} style={styleRow}>
      <td>
        {lodash.get(correlation, 'experimentType', false)
          ? correlation.experimentType.toUpperCase()
          : ''}
      </td>
      <td style={styleLabel}>{getLabel(correlation)}</td>
      <td>
        {lodash.get(correlation, 'signal.delta', false)
          ? correlation.signal.delta.toFixed(3)
          : ''}
      </td>
      <td>{''}</td>
      {additionalColumnsData}
    </tr>
  );
};

export default CorrelationTableRow;
