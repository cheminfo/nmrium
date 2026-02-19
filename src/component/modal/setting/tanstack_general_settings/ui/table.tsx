import { Checkbox, Classes } from '@blueprintjs/core';
import type { CSSObject } from '@emotion/react';
import styled from '@emotion/styled';
import type { RowData } from '@tanstack/react-table';
import type { CSSProperties, ComponentProps } from 'react';

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
 * It's styling for tables in settings, it should be used with `.withComponent(Table<YourDataType>)`.
 * It seems it is the only way to use styled components with a generic component.
 *
 * @example
 *
 * ```tsx
 * import { Table, createTableColumnHelper } from 'react-science/ui';
 *
 * interface MyData {
 *   foo: string;
 * }
 *
 * const TableStyled = NewTableSettings.withComponent(Table<MyData>);
 *
 * const columnHelper = createTableColumnHelper<MyData>();
 * const columns = [
 *  columnHelper.accessor('foo', 'Foo'),
 * ];
 *
 * export function MyDataTable() {
 *  const data = [];
 *  return <TableStyled data={data} columns={columns} />;
 * }
 *
 * ```
 */
export const NewTableSettings = styled.table`
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
