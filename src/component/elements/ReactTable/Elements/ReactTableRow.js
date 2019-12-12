/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useCallback } from 'react';

import { useDispatch } from '../../../context/DispatchContext';

const ReactTableRow = ({ row, dispatchType, highlightedRowStyle }) => {
  const dispatch = useDispatch();

  const onMouseEnterHandler = useCallback(
    (id) => {
      if (dispatchType) {
        dispatch({
          type: dispatchType, // dispatch type to be given to know what object should be set as highlighted, e.g. "HIGHLIGHT_RANGES" in Actions.js
          id: id, // constant property "id" within each object to highlight, e.g. id property for each range
          _highlight: true,
        });
      }
    },
    [dispatch, dispatchType],
  );
  const onMouseLeaveHandler = useCallback(
    (id) => {
      if (dispatchType) {
        dispatch({
          type: dispatchType,
          id: id,
          _highlight: false,
        });
      }
    },
    [dispatch, dispatchType],
  );

  return (
    <tr
      key={row.getRowProps().key}
      onMouseEnter={() => onMouseEnterHandler(row.original.id)} // the id property has to be given within a ReactTable component
      onMouseLeave={() => onMouseLeaveHandler(row.original.id)} // the id property has to be given within a ReactTable component
      css={
        row.original._highlight && row.original._highlight === true
          ? highlightedRowStyle
          : null
      }
      {...row.getRowProps()}
    >
      {row.cells.map((cell) => {
        return (
          <td key={cell.getCellProps().key} {...cell.getCellProps()}>
            {cell.render('Cell')}
          </td>
        );
      })}
    </tr>
  );
};

export default ReactTableRow;
