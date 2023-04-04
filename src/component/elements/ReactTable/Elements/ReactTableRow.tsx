/** @jsxImportSource @emotion/react */

import { css, CSSObject } from '@emotion/react';
import { useMemo, useEffect, useCallback } from 'react';
import { DropdownMenu } from 'react-science/ui';

import { HighlightEventSource, useHighlight } from '../../../highlight/index';
import { BaseRowStyle, ContextMenuProps } from '../ReactTable';

function getRowStyle(
  isActive: boolean,
  rowStyle: BaseRowStyle = {},
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
    ? (base as CSSObject)
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
interface ReactTableRowProps extends ClickEvent, ContextMenuProps {
  row: any;
  highlightedSource?: HighlightEventSource;
  isRowActive: boolean;
  rowStyle: BaseRowStyle | undefined;
  disableDefaultRowStyle?: boolean;
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
function ReactTableRow(props: ReactTableRowProps) {
  const {
    row,
    highlightedSource = HighlightEventSource.UNKNOWN,
    onContextMenuSelect,
    contextMenu = [],
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
      key={row.getRowProps().key}
      css={getRowStyle(
        highlight.isActive || isRowActive,
        rowStyle,
        disableDefaultRowStyle,
      )}
      {...row.getRowProps()}
      {...highlight.onHover}
    >
      <DropdownMenu
        trigger="contextMenu"
        options={contextMenu}
        onSelect={(selected) => onContextMenuSelect?.(selected, row.original)}
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
      </DropdownMenu>
    </tr>
  );
}

export default ReactTableRow;
