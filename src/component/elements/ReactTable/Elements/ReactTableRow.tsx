/** @jsxImportSource @emotion/react */

import { css, CSSObject } from '@emotion/react';
import { useMemo, forwardRef, useEffect, useCallback } from 'react';

import { HighlightEventSource, useHighlight } from '../../../highlight/index';

function highlightStyle(isActive: boolean, row): CSSObject {
  if (isActive) {
    return { backgroundColor: '#ff6f0057' };
  } else if (row.original?.isConstantlyHighlighted === true) {
    return { backgroundColor: '#f5f5dc' };
  }
  return {};
}

const rowCss = css`
  &:hover {
    background-color: #ff6f0091 !important;
  }

  &:active {
    background-color: #ff6f0070 !important;
  }
`;

export interface ClickEvent {
  onClick?: (event: Event, data: unknown) => void;
}
interface ReactTableRowProps extends ClickEvent {
  row: any;
  highlightedSource?: HighlightEventSource;
  onContextMenu: () => void;
  isVisible: boolean;
  isRowActive: boolean;
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
    highlightedSource = HighlightEventSource.UNKNOWN,
    onContextMenu,
    onClick,
    isRowActive = false,
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

  return useMemo(() => {
    return (
      <tr
        ref={ref}
        onContextMenu={onContextMenu}
        key={row.getRowProps().key}
        css={[
          highlightStyle(highlight.isActive || isRowActive, row),
          onClick && rowCss,
        ]}
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
  }, [
    clickHandler,
    highlight.isActive,
    highlight.onHover,
    isRowActive,
    onClick,
    onContextMenu,
    ref,
    row,
  ]);
}

export default forwardRef(ReactTableRow);
