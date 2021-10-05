/** @jsxImportSource @emotion/react */
import { getCorrelationDelta } from 'nmr-correlation';
import { useCallback, useMemo, useRef } from 'react';

import { buildID } from '../../../../data/utilities/Concatenation';
import { findRangeOrZoneID } from '../../../../data/utilities/FindUtilities';
import { useAssignmentData } from '../../../assignment';
import { useDispatch } from '../../../context/DispatchContext';
import ContextMenu from '../../../elements/ContextMenu';
import { useHighlight } from '../../../highlight';
import { DELETE_CORRELATION } from '../../../reducer/types/Types';
import { getLabelColor } from '../Utilities';

function AdditionalColumnHeader({
  spectraData,
  correlationsData,
  correlation,
}) {
  const contextRef = useRef<any>();
  const dispatch = useDispatch();
  const assignmentData = useAssignmentData();

  const highlightIDsAdditionalColumn = useMemo(() => {
    if (correlation.pseudo === true) {
      return [];
    }
    const ids: string[] = [];
    correlation.link.forEach((link) => {
      if (link.pseudo === false) {
        ids.push(link.signal.id);
        ids.push(buildID(link.signal.id, 'Crosshair_X'));
        const _id = findRangeOrZoneID(
          spectraData,
          link.experimentID,
          link.signal.id,
          true,
        );
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
      title:
        correlation.pseudo === false &&
        correlation.link
          .reduce((arr, link) => {
            if (
              link.pseudo === false &&
              !arr.includes(link.experimentType.toUpperCase())
            ) {
              arr.push(link.experimentType.toUpperCase());
            }
            return arr;
          }, [])
          .sort()
          .join('/'),
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

  const onClickContextMenuOption = useCallback(
    (action: string) => {
      if (action === 'remove') {
        dispatch({
          type: DELETE_CORRELATION,
          payload: {
            correlation,
            assignmentData,
          },
        });
      }
    },
    [assignmentData, correlation, dispatch],
  );

  const contextMenu = useMemo(() => {
    return correlation.pseudo === false
      ? [
          {
            label: `delete ${correlation.label.origin}`,
            onClick: () => {
              onClickContextMenuOption('remove');
            },
          },
        ]
      : [];
  }, [correlation.label.origin, correlation.pseudo, onClickContextMenuOption]);

  const contextMenuHandler = useCallback(
    (e) => {
      e.preventDefault();
      contextRef.current.handleContextMenu(e);
    },
    [contextRef],
  );

  const { title, ...thProps } = tableHeaderProps;

  return (
    <th {...thProps} title={title === false ? undefined : title}>
      <div
        style={{ display: 'block' }}
        onContextMenu={(e) => {
          if (contextMenu.length > 0) {
            contextMenuHandler(e);
          }
        }}
      >
        <p>{correlation.label.origin}</p>
        <p>
          {getCorrelationDelta(correlation)
            ? getCorrelationDelta(correlation).toFixed(2)
            : ''}
        </p>
        <p style={equivalenceTextStyle}>
          {Number.isInteger(correlation.equivalence)
            ? correlation.equivalence
            : correlation.equivalence.toFixed(2)}
        </p>
        <ContextMenu ref={contextRef} context={contextMenu} />
      </div>
    </th>
  );
}

export default AdditionalColumnHeader;
