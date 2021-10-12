/** @jsxImportSource @emotion/react */
import { useCallback, useMemo } from 'react';

import { buildID } from '../../../../data/utilities/Concatenation';
import { useHighlight } from '../../../highlight';
import { findRangeOrZoneID, getLabelColor } from '../Utilities';
import getTitle from './getTitle';

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
        ids.push(buildID(link.signal.id, 'Crosshair_X'));
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
        ...{ color: getLabelColor(correlationsData, correlation) || undefined },
        backgroundColor: highlightAdditionalColumn.isActive
          ? '#ff6f0057'
          : 'inherit',
      },
      title: getTitle(correlation),
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

  const equivalenceTextStyle = useMemo(() => {
    return correlation.edited.equivalence
      ? { backgroundColor: '#F7F2E0' }
      : {
          color: Number.isInteger(correlation.equivalence)
            ? correlation.equivalence === 1
              ? '#bebebe'
              : 'black'
            : 'red',
        };
  }, [correlation]);

  const { title, ...thProps } = tableHeaderProps;

  return (
    <th {...thProps} title={title === false ? undefined : title}>
      <div style={{ display: 'block' }}>
        <p>{correlation.label.origin}</p>
        <p>
          {correlation?.signal?.delta
            ? correlation.signal.delta.toFixed(2)
            : ''}
        </p>
        <p style={equivalenceTextStyle}>
          {Number.isInteger(correlation.equivalence)
            ? correlation.equivalence
            : correlation.equivalence.toFixed(2)}
        </p>
      </div>
    </th>
  );
}

export default AdditionalColumnHeader;
