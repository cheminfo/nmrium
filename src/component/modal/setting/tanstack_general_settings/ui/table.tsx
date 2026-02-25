import { Checkbox, Classes, Icon, NumericInput } from '@blueprintjs/core';
import type { CSSObject } from '@emotion/react';
import type { StyledComponent } from '@emotion/styled';
import styled from '@emotion/styled';
import type { RowData } from '@tanstack/react-table';
import type { CSSProperties, ComponentProps, ReactNode } from 'react';
import { useCallback } from 'react';
import type { ButtonProps, GetTdProps, TableProps } from 'react-science/ui';
import { Button, Table } from 'react-science/ui';

import { Input2 } from '../../../../elements/Input2.js';
import type { BaseRowStyle } from '../../../../elements/ReactTable/ReactTable.js';
import ReactTable from '../../../../elements/ReactTable/ReactTable.js';

const tableStyle: CSSObject = {
  'thead tr th': { zIndex: 1 },
  td: { padding: 0 },
};

const rowStyle: BaseRowStyle = {
  hover: { backgroundColor: '#f7f7f7' },
  active: { backgroundColor: '#f5f5f5' },
};

export const CellInput = styled(Input2)`
  input {
    background-color: transparent;
    box-shadow: none;
    outline: none;
  }

  input.${Classes.INPUT}:focus {
    box-shadow: none;
    outline: none;
  }
`;

export const CellNumericInput = styled(NumericInput)`
  input {
    background-color: transparent;
    box-shadow: none;
    outline: none;
  }

  input.${Classes.INPUT}:focus {
    box-shadow: none;
    outline: none;
  }

  &.${Classes.CONTROL_GROUP}
    .${Classes.BUTTON_GROUP}.${Classes.VERTICAL}
    > .${Classes.BUTTON} {
    border-radius: 0;
    background: white;
    box-shadow: none;
    border-left: 1px dotted lightgray;
  }
`;

export const CellCheckbox = styled(Checkbox)`
  display: flex;
  align-items: center;
  justify-content: center;

  &.${Classes.CONTROL} {
    padding: 0;
    margin: 0;

    .${Classes.CONTROL_INDICATOR} {
      margin: 0;
    }
  }
`;

export const CellActions = styled.div`
  display: flex;
  justify-content: space-evenly;
  gap: 0.25em;
`;

export function CellActionsButton(props: ButtonProps) {
  const { size = 'small', variant = 'minimal' } = props;

  return <Button {...props} size={size} variant={variant} />;
}

export function TableSettings<T extends object>(
  props: Omit<ComponentProps<typeof ReactTable<T>>, 'style' | 'rowStyle'>,
) {
  return <ReactTable<T> {...props} style={tableStyle} rowStyle={rowStyle} />;
}

declare module '@tanstack/react-table' {
  // Declaration merging
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /**
     * Merged into the `style` prop of the default-rendered `<th>` element.
     */
    tdStyle?: CSSProperties;
  }
}

type NewTableSettingsProps<Data extends RowData> = {
  emptyIcon?: ReactNode;
  emptyContent?: ReactNode;
} & TableProps<Data>;

/**
 * Return stylized table.
 * It set `compact`, `bordered` and `stickyHeader` props to true by default.
 * It add supports for `tdStyle` `meta` property in columns definition.
 */
export function NewTableSettings<Data extends RowData>(
  props: NewTableSettingsProps<Data>,
) {
  const {
    emptyIcon = <Icon icon="eye-off" />,
    emptyContent = 'No data',
    getTdProps,
    ...tableProps
  } = props;

  const getTdPropsMerge = useCallback<GetTdProps<Data>>(
    (cell) => {
      const tdStyleMeta = cell.column.columnDef.meta?.tdStyle;
      const tdProps = getTdProps?.(cell);

      return { ...tdProps, style: { ...tdStyleMeta, ...tdProps?.style } };
    },
    [getTdProps],
  );

  // We should not create a component in another component,
  // But here it's OK, it is just an alias to fix the type
  const Table = NewTableSettingsStyled as StyledComponent<TableProps<Data>>;

  return (
    <TableContainer>
      <Table
        compact
        bordered
        stickyHeader
        {...tableProps}
        getTdProps={getTdPropsMerge}
      />

      {props.data.length === 0 && (
        <TableEmptyState bordered={tableProps.bordered ?? true}>
          {emptyIcon}
          {emptyContent}
        </TableEmptyState>
      )}
    </TableContainer>
  );
}

const TableContainer = styled.div`
  height: 100%;
`;
const NewTableSettingsStyled = styled(Table)`
  overflow: auto;

  ${(props) => (props.bordered ? `border: 1px solid #11141826;` : '')}

  &.${Classes.HTML_TABLE} {
    font-size: 12px;
    width: 100%;

    thead th {
      padding: 2px 8px;
      text-align: center;
      font-weight: bold;

      /* See getThProps in react-science table_header_cell */
      > div > div {
        flex: 1;
      }
    }

    tbody td {
      padding: 0;
      vertical-align: middle;
    }
  }
`;
const TableEmptyState = styled.div<{ bordered?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25em;
  gap: 0.5em;

  ${(props) => {
    if (!props.bordered) return '';

    return `
      border: 1px solid #11141826;
      border-top: none;
    `;
  }}
`;
