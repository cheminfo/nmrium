import lodash from 'lodash';
import React, { useMemo } from 'react';

import { getLabel } from './Utilities';

const CorrelationTableRow = ({
  additionalColumns,
  correlations,
  correlation,
  key,
  styleRow,
  styleLabel,
}) => {
  const additionalColumnsData = useMemo(
    () =>
      additionalColumns.map((experimentType, n) => {
        let content = '';
        if (lodash.get(correlation, 'correlation', false)) {
          let labels = [];
          correlation.correlation.forEach((_correlation) => {
            if (_correlation.experimentType === experimentType) {
              _correlation.match.forEach((match) => {
                const otherAtomType =
                  _correlation.atomTypes[_correlation.axis === 'x' ? 1 : 0]; // reversed to get the other atom type
                const matchingCorrelation =
                  correlations[otherAtomType][match.index];
                labels.push(getLabel(matchingCorrelation));
              });
            }
          });

          labels = labels
            .flat()
            .filter((label) => label.length > 0)
            .filter((label, i, a) => a.indexOf(label) === i)
            .sort((a, b) =>
              Number(a.split(/[a-z]+/i)[1]) - Number(b.split(/[a-z]+/i)[1]) < 0
                ? -1
                : Number(a.split(/[a-z]+/i)[1]) -
                    Number(b.split(/[a-z]+/i)[1]) ===
                    0 && a.split(/\d+/)[1] < b.split(/\d+/)[1]
                ? -1
                : 1,
            );

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
    <tr key={key} style={styleRow}>
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
