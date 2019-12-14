/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useCallback, useMemo } from 'react';

import { useChartData } from '../../../context/ChartContext';
import { useDispatch } from '../../../context/DispatchContext';
import { ADD_HIGHLIGHT, DELETE_HIGHLIGHT } from '../../../reducer/Actions';
import { HighlightedRowStyle } from '../Style';

const ReactTableRow = ({ row }) => {
  const { activeSpectrum, highlights } = useChartData();
  const dispatch = useDispatch();

  const onMouseEnterAndLeaveHandler = useCallback(
    (dispatchType, type, id) => {
      dispatch({
        type: dispatchType,
        data: {
          spectrumID: activeSpectrum.id,
          objectType: type,
          objectID: id,
        },
      });
    },
    [activeSpectrum.id, dispatch],
  );

  // returning an array because of potential multiple object selection in future
  const highlighted = useMemo(() => {
    return activeSpectrum && highlights && highlights[activeSpectrum.id]
      ? highlights[activeSpectrum.id]
      : [];
  }, [activeSpectrum, highlights]);

  return (
    <tr
      key={row.getRowProps().key}
      onMouseEnter={
        () =>
          onMouseEnterAndLeaveHandler(
            ADD_HIGHLIGHT,
            row.original.type,
            row.original.id,
          ) // the type and id property has to be given through a ReactTable component
      }
      onMouseLeave={
        () =>
          onMouseEnterAndLeaveHandler(
            DELETE_HIGHLIGHT,
            row.original.type,
            row.original.id,
          ) // the type and id property has to be given through a ReactTable component
      }
      css={
        highlighted.find(
          (highlight) =>
            highlight.type === row.original.type &&
            highlight.id === row.original.id,
        )
          ? HighlightedRowStyle
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
