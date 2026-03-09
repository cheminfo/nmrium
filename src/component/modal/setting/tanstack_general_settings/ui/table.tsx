import { Classes } from '@blueprintjs/core';
import type { StyledComponent } from '@emotion/styled';
import styled from '@emotion/styled';
import type { RowData } from '@tanstack/react-table';
import type { TableProps } from 'react-science/ui';
import { Table } from 'react-science/ui';

type MakeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

type TableSettingsProps<Data extends RowData> = MakeRequired<
  TableProps<Data>,
  'getRowId'
>;

/**
 * Return stylized table.
 * It set `compact`, `bordered` and `stickyHeader` props to true by default.
 * It adds supports for `tdStyle` `meta` property in columns definition.
 * It needs a mandatory ` getRowId ` prop.
 *   Table with fields in the columns is known to cause issue if the row key is index.
 *   use `withUUID` validation helper to have items with uuid
 */
export function TableSettings<Data extends RowData>(
  props: TableSettingsProps<Data>,
) {
  // We should not create a component in another component,
  // But here it's OK, it is just an alias to fix the type
  const Table = TableSettingsStyled as StyledComponent<
    TableSettingsProps<Data>
  >;

  return <Table compact bordered stickyHeader {...props} />;
}

const TableSettingsStyled = styled(Table)`
  overflow: auto;

  ${(props) => (props.bordered ? `border: 1px solid #11141826;` : '')}

  &.${Classes.HTML_TABLE} {
    font-size: 12px;
    width: 100%;

    thead th {
      padding: 2px 8px;
      text-align: center;
      vertical-align: bottom;
      font-weight: bold;

      /* See getThProps in react-science table_header_cell */
      > div > div {
        flex: 1;
      }
    }

    tbody {
      tr:active {
        background-color: #f5f5f5;
      }

      tr:hover {
        background-color: #f7f7f7;
      }

      td {
        padding: 0;
        vertical-align: middle;
      }
    }
  }
`;
