/** @jsxImportSource @emotion/react */

import { css, CSSObject } from '@emotion/react';
import { useMemo, forwardRef, useEffect, useCallback, MouseEvent } from 'react';

import { HighlightEventSource, useHighlight } from '../../../highlight/index';
import { RowStyle } from '../ReactTable';

function getRowStyle(
  isActive: boolean,
  rowStyle: RowStyle['rowStyle'] = {},
  disableDefaultRowStyle?: boolean,
) {
  const { hover = {}, active = {}, base = {}, activated = {} } = rowStyle;

  const hoverStyle = disableDefaultRowStyle
    ? (hover as CSSObject)
    : { backgroundColor: '#ff6f0091', ...hover };
  const activeStyle = disableDefaultRowStyle
    ? (active as CSSObject)
    : { backgroundColor: '#ff6f0070', ...active };
  const baseStyle = disableDefaultRowStyle
    ? (active as CSSObject)
    : { backgroundColor: 'white', ...base };

  return css([
    {
      ...baseStyle,
      ...(isActive && { backgroundColor: '#ff6f0070', ...activated }),
    },
    { ':hover': hoverStyle, ':active': activeStyle },
  ]);
}

export interface ClickEvent {
  onClick?: (event: Event, data: unknown) => void;
}
interface ReactTableRowProps extends ClickEvent, RowStyle {
  row: any;
  highlightedSource?: HighlightEventSource;
  onContextMenu: (e: MouseEvent<HTMLTableRowElement>) => void;
  isRowActive: boolean;
}

function getIDs(row: any): string[] {
  const id = row.original.id;
  if (id) {
    if (Array.isArray(id)) {
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
    highlightedSource = HighlightEventSource.UNKNOWN,
    onContextMenu,
    onClick,
    isRowActive = false,
    rowStyle,
    disableDefaultRowStyle,
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

  const clickHandler = useCallback(
    (event: Event) => {
      onClick?.(event, row);
    },
    [onClick, row],
  );
  return (
    <tr
      ref={ref}
      onContextMenu={onContextMenu}
      key={row.getRowProps().key}
      css={getRowStyle(
        highlight.isActive || isRowActive,
        rowStyle,
        disableDefaultRowStyle,
      )}
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
              onClick={clickHandler}
            >
              {cell.render('Cell')}
            </td>
          );
        }
      })}
    </tr>
  );
}

export default forwardRef(ReactTableRow);
