/** @jsxImportSource @emotion/react */
import { useCallback, useMemo } from 'react';

import { buildID } from '../../../../data/utilities/Concatenation';
import { useHighlight } from '../../../highlight';
import { findRangeOrZoneID, getLabelColor } from '../Utilities';

function AdditionalColumnHeader({
  spectraData,
  correlationsData,
  correlation,
}) {
  const highlightIDsAdditionalColumn = useMemo(() => {
    if (correlation.pseudo === true) {
      return [];
    }
    const ids = [
      correlation.signal.id,
      buildID(correlation.signal.id, 'Crosshair_X'),
    ];
    const id = findRangeOrZoneID(spectraData, correlation);
    if (id) {
      ids.push(id);
    }
    correlation.link.forEach((link) => {
      if (link.pseudo === false) {
        ids.push(link.signal.id);
        const _id = findRangeOrZoneID(spectraData, link);
        if (_id) {
          ids.push(_id);
        }
      }
    });

    return ids;
  }, [correlation, spectraData]);
  const highlightAdditionalColumn = useHighlight(highlightIDsAdditionalColumn);

  const mouseEnterHandler = useCallback(
    (event) => {
      event.currentTarget.focus();
      highlightAdditionalColumn.show();
    },
    [highlightAdditionalColumn],
  );
  const mouseLeaveHandler = useCallback(
    (event) => {
      event.currentTarget.blur();
      highlightAdditionalColumn.hide();
    },
    [highlightAdditionalColumn],
  );

  const tableHeaderProps = useMemo(() => {
    return {
      style: {
        ...{ color: getLabelColor(correlationsData, correlation) },
        backgroundColor: highlightAdditionalColumn.isActive
          ? '#ff6f0057'
          : 'inherit',
      },
      onMouseEnter: mouseEnterHandler,
      onMouseLeave: mouseLeaveHandler,
    };
  }, [
    correlation,
    correlationsData,
    highlightAdditionalColumn.isActive,
    mouseEnterHandler,
    mouseLeaveHandler,
  ]);

  return (
    <th {...tableHeaderProps}>
      <div style={{ display: 'block' }}>
        <p>{correlation.label.origin}</p>
        <p>
          {correlation && correlation.signal && correlation.signal.delta
            ? correlation.signal.delta.toFixed(3)
            : ''}
        </p>
        <p style={{ fontSize: 8 }}>
          {`${
            correlation.experimentType
              ? `${correlation.experimentType.toUpperCase()}`
              : ''
          } ${
            correlation.equivalence > 1 ? `(${correlation.equivalence})` : ''
          }`}
        </p>
      </div>
    </th>
  );
}

export default AdditionalColumnHeader;
