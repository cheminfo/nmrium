import { Checkbox, Classes } from '@blueprintjs/core';
import type { CSSObject } from '@emotion/react';
import type { StyledComponent } from '@emotion/styled';
import styled from '@emotion/styled';
import type { RowData } from '@tanstack/react-table';
import type { CSSProperties, ComponentProps } from 'react';
import { useCallback } from 'react';
import type { GetTdProps, TableProps } from 'react-science/ui';
import { Table } from 'react-science/ui';

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

export const CellCheckbox = styled(Checkbox)`
  margin: 6px auto;
  display: inline;
`;

export const CellActions = styled.div`
  display: flex;
  justify-content: space-evenly;
  gap: 0.25em;
`;

export function TableSettings<T extends object>(
  props: Omit<ComponentProps<typeof ReactTable<T>>, 'style' | 'rowStyle'>,
) {
  return <ReactTable<T> {...props} style={tableStyle} rowStyle={rowStyle} />;
}

/**
 * Return stylized table.
 * It set `compact`, `bordered` and `stickyHeader` props to true by default.
 * It add supports for `tdStyle` `meta` property in columns definition.
 */
export function NewTableSettings<Data extends RowData>(
  props: TableProps<Data>,
) {
  const getTdPropsProp = props.getTdProps;
  const getTdPropsMerge = useCallback<GetTdProps<Data>>(
    (cell) => {
      const tdStyleMeta = cell.column.columnDef.meta?.tdStyle;
      const tdProps = getTdPropsProp?.(cell);

      return { ...tdProps, style: { ...tdStyleMeta, ...tdProps?.style } };
    },
    [getTdPropsProp],
  );

  // We should not create a component in another component,
  // But here it's OK, it is just an alias to fix the type
  const Table = NewTableSettingsStyled as StyledComponent<TableProps<Data>>;

  return (
    <Table
      compact
      bordered
      stickyHeader
      {...props}
      getTdProps={getTdPropsMerge}
    />
  );
}

const NewTableSettingsStyled = styled(Table)`
  ${(props) => (props.bordered ? `border: 1px solid #11141826;` : '')}

  &.${Classes.HTML_TABLE} {
    font-size: 12px;

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
