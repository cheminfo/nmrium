/** @jsxImportSource @emotion/react */

import { useMemo } from 'react';

import { useHighlight } from '../../../highlight/index';
import { HighlightedRowStyle, ConstantlyHighlightedRowStyle } from '../Style';

interface ReactTableRowProps {
  row: any;
  onContextMenu: () => void;
}

function getIDs(row: any): string[] {
  const id = row.original.id;
  if (id) {
    if (id instanceof Array) {
      return id;
    } else {
      return [String(id)];
    }
  }
  return [''];
}

function ReactTableRow({ row, onContextMenu }: ReactTableRowProps) {
  const highlight = useHighlight(getIDs(row));
  return useMemo(() => {
    return (
      <tr
        onContextMenu={onContextMenu}
        key={row.getRowProps().key}
        css={
          highlight.isActive
            ? HighlightedRowStyle
            : Object.prototype.hasOwnProperty.call(
                row.original,
                'isConstantlyHighlighted',
              ) && row.original.isConstantlyHighlighted === true
            ? ConstantlyHighlightedRowStyle
            : null
        }
        {...row.getRowProps()}
        {...highlight.onHover}
      >
        {row.cells.map((cell) => {
          const { minWidth, maxWidth, width, padding } = cell.column;

          if (cell.isRowSpanned) {
            return null;
          } else {
            return (
              <td
                rowSpan={cell.rowSpan}
                key={cell.key}
                {...cell.getCellProps()}
                onContextMenu={(e) => {
                  e.preventDefault();

                  return false;
                }}
                style={{ minWidth, maxWidth, width, padding }}
              >
                {cell.render('Cell')}
              </td>
            );
          }
        })}
      </tr>
    );
  }, [highlight.isActive, highlight.onHover, onContextMenu, row]);
}

export default ReactTableRow;
