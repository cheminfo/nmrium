/** @jsxImportSource @emotion/react */
import type { CSSObject, SerializedStyles } from '@emotion/react';
import { css } from '@emotion/react';
import type { MouseEvent } from 'react';
import { useCallback, useEffect, useMemo } from 'react';

import type { HighlightEventSource } from '../../../highlight/index.js';
import { useHighlight } from '../../../highlight/index.js';
import type { BaseContextMenuProps } from '../../ContextMenuBluePrint.js';
import { ContextMenu } from '../../ContextMenuBluePrint.js';
import type {
  TanStackReactTable,
  TanStackRowData,
  TanStackTableClickEvent,
  TanStackTableContextMenuProps,
  TanStackTableHighlightSourceProps,
  TanStackTableRow,
  TanStackTableRowStyle,
} from '../types.ts';

function getRowStyle(
  isActive: boolean,
  rowStyle: TanStackTableRowStyle = {},
  disableDefaultRowStyle?: boolean,
): SerializedStyles {
  const { hover = {}, active = {}, base = {}, activated = {} } = rowStyle;

  const hoverStyle = disableDefaultRowStyle
    ? (hover as CSSObject)
    : { backgroundColor: '#ff6f0091', ...hover };
  const activeStyle = disableDefaultRowStyle
    ? (active as CSSObject)
    : { backgroundColor: '#ff6f0070', ...active };
  const baseStyle = disableDefaultRowStyle
    ? (base as object)
    : { backgroundColor: 'white', ...base };

  return css([
    {
      ...baseStyle,
      ...(isActive && { backgroundColor: '#ff6f0070', ...activated }),
    },
    { ':hover': hoverStyle, ':active': activeStyle },
  ]);
}

interface TableRowProps<TData extends TanStackRowData>
  extends TanStackTableClickEvent<TData>, TanStackTableContextMenuProps<TData> {
  row: TanStackTableRow<TData>;
  table: TanStackReactTable<TData>;
  isRowActive: boolean;
  rowStyle: TanStackTableRowStyle | undefined;
  disableDefaultRowStyle?: boolean;
}

type TableRowPropsWithHighlight<TData extends TanStackRowData> =
  TableRowProps<TData> & TanStackTableHighlightSourceProps<TData>;

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

export default function TableRow<TData extends TanStackRowData>(
  props: TableRowPropsWithHighlight<TData>,
) {
  const {
    row,
    table,
    highlightedSource = 'UNKNOWN',
    getHighlightExtra,
    onContextMenuSelect,
    contextMenu = [],
    onClick,
    isRowActive = false,
    rowStyle,
    disableDefaultRowStyle,
  } = props;
  const data = useMemo(
    (): HighlightEventSource =>
      ({
        type: highlightedSource,
        extra: getHighlightExtra?.(row.original),
      }) as HighlightEventSource,
    [highlightedSource, row.original, getHighlightExtra],
  );
  const highlight = useHighlight(getIDs(row), data);

  useEffect(() => {
    return () => {
      highlight.hide();
    };
    // TODO: avoid this hack.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clickHandler = useCallback(
    (event: MouseEvent) => {
      onClick?.(event, row);
    },
    [onClick, row],
  );

  return (
    <ContextMenu
      data={row.original}
      options={contextMenu}
      onSelect={(selected: Parameters<BaseContextMenuProps['onSelect']>[0]) =>
        onContextMenuSelect?.(selected, row.original)
      }
      as="tr"
      style={{ position: 'static' }}
      css={getRowStyle(
        highlight.isActive || isRowActive,
        rowStyle,
        disableDefaultRowStyle,
      )}
      {...highlight.onHover}
    >
      {row.getAllCells().map((cell) => {
        const rowSpan = cell.getRowSpan();
        const colSpan = cell.getColSpan();
        // When span is 0, it means that the cell is covered by another one,
        // so it should not be rendered.
        if (rowSpan === 0 || colSpan === 0) return null;

        const meta = cell.column.columnDef.meta;
        return (
          <td
            key={cell.id}
            rowSpan={rowSpan}
            colSpan={colSpan}
            onContextMenu={(e) => {
              e.preventDefault();

              return false;
            }}
            style={{
              ...meta?.style,
              ...meta?.tdStyle,
            }}
            onClick={clickHandler}
          >
            <table.FlexRender cell={cell} />
          </td>
        );
      })}
    </ContextMenu>
  );
}
