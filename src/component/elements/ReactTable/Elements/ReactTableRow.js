/** @jsx jsx */
import { jsx } from '@emotion/core';

import { useHighlight } from '../../../highlight/index';
import { HighlightedRowStyle } from '../Style';

const ReactTableRow = ({ row }) => {
  const highlight = useHighlight([
    Object.prototype.hasOwnProperty.call(row.original, 'id')
      ? row.original.id
      : '',
  ]);

  return (
    <tr
      key={row.getRowProps().key}
      css={highlight.isActive ? HighlightedRowStyle : null}
      {...row.getRowProps()}
      {...highlight.onHover}
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
