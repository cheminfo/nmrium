/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useCallback, useMemo } from 'react';

import { useChartData } from '../../../context/ChartContext';
import { useDispatch } from '../../../context/DispatchContext';
import { ADD_HIGHLIGHT, DELETE_HIGHLIGHT } from '../../../reducer/Actions';
import { HighlightedRowStyle } from '../Style';

const ReactTableRow = ({ row, type }) => {
  const { activeSpectrum, highlights } = useChartData();
  const dispatch = useDispatch();

  const onMouseEnterAndLeaveHandler = useCallback(
    (dispatchType, id) => {
      if (activeSpectrum && activeSpectrum.id) {
        dispatch({
          type: dispatchType,
          data: {
            spectrumID: activeSpectrum.id,
            objectType: type,
            objectID: id,
          },
        });
      }
    },
    [activeSpectrum, dispatch, type],
  );

  // returning an array because of potential multiple object selection in future
  const highlighted = useMemo(() => {
    return activeSpectrum &&
      activeSpectrum.id &&
      highlights &&
      highlights[activeSpectrum.id]
      ? highlights[activeSpectrum.id]
      : [];
  }, [activeSpectrum, highlights]);

  return (
    <tr
      key={row.getRowProps().key}
      onMouseEnter={
        () => onMouseEnterAndLeaveHandler(ADD_HIGHLIGHT, row.original.id) // the id property has to be given through a ReactTable component
      }
      onMouseLeave={
        () => onMouseEnterAndLeaveHandler(DELETE_HIGHLIGHT, row.original.id) // the id property has to be given through a ReactTable component
      }
      css={
        highlighted.find(
          (highlight) =>
            highlight.type === type && highlight.id === row.original.id,
        )
          ? HighlightedRowStyle
          : null
      }
      {...row.getRowProps()}
    >
      {row.cells.map((cell) => {
        return (
          <td key={cell.key} {...cell.getCellProps()}>
            {cell.render('Cell')}
          </td>
        );
      })}
    </tr>
  );
};

export default ReactTableRow;
