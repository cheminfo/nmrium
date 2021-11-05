/** @jsxImportSource @emotion/react */

import { useMemo, forwardRef, useEffect } from 'react';

import { HighlightedSource, useHighlight } from '../../../highlight/index';
import { HighlightedRowStyle, ConstantlyHighlightedRowStyle } from '../Style';

interface ReactTableRowProps {
  row: any;
  highlightedSource?: HighlightedSource;
  onContextMenu: () => void;
  isVisible: boolean;
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
function ReactTableRow(props: ReactTableRowProps, ref) {
  const {
    row,
    highlightedSource = HighlightedSource.UNKNOWN,
    onContextMenu,
  } = props;
  const data = useMemo(
    () => ({
      type: highlightedSource,
      extra: row.original,
    }),
    [highlightedSource, row],
  );
  const highlight = useHighlight(getIDs(row), data);

  useEffect(() => {
    return () => {
      highlight.hide();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useMemo(() => {
    return (
      <tr
        ref={ref}
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
          const { style, padding } = cell.column;

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
                style={{ padding, ...style }}
              >
                {cell.render('Cell')}
              </td>
            );
          }
        })}
      </tr>
    );
  }, [highlight.isActive, highlight.onHover, onContextMenu, ref, row]);
}

export default forwardRef(ReactTableRow);
