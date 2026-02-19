import { Icon } from '@blueprintjs/core';
import type { RowData, Table, TableOptions } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

import type { TableComponents } from './base_components.tsx';
import {
  BaseEmptyState,
  BaseTBody,
  BaseTDBody,
  BaseTDBodyEmpty,
  BaseTFoot,
  BaseTHFoot,
  BaseTHHead,
  BaseTHead,
  BaseTRBody,
  BaseTRBodyEmpty,
  BaseTRFoot,
  BaseTRHead,
  BaseTable,
} from './base_components.tsx';

type TablePropsHookOptions<Data extends RowData> = Omit<
  TableOptions<Data>,
  'data' | 'columns'
>;

interface TableProps<Data extends RowData> {
  data: TableOptions<Data>['data'];
  columns: TableOptions<Data>['columns'];
  emptyRowIcon?: ReactNode;
  emptyRowContent?: ReactNode;

  /**
   * Additional props to pass to the useReactTable hook.
   * Note: all `get*RowModel` already default to tanstack `get*RowModel`
   * @see https://tanstack.com/table/latest/docs/api/core/table#usereacttable--createsolidtable--useqwiktable--usevuetable--createsveltetable
   */
  tableHookProps?: TablePropsHookOptions<Data>;

  /**
   * To style the table node with `@emotion/styled`
   */
  className?: string;

  /**
   * All nodes rendered by the table component are replaceable with these custom components.
   * You can use them to:
   * - customize the look of the table with styled components
   * - inject context
   * - inject props to the dom nodes
   * - customize the render logic
   *
   * All your custom components will receive the following props (if applicable):
   * - components (with defaults)
   * - table
   * - headerGroup / footerGroup
   * - header / footer
   * - row
   * - cell
   * - children
   *
   * If a component doesn't forward children, it means it has to reimplement children logic rendering.
   * That's why each of them receives `components` prop.
   *
   * To render cell children, you should use `flexRender` from `@tanstack/react-table`
   */
  components?: Partial<TableComponents<Data>>;
}

export function Table<Data extends RowData>(props: TableProps<Data>) {
  const {
    columns,
    data,
    tableHookProps,
    className,
    emptyRowIcon = <Icon icon="eye-off" />,
    emptyRowContent = 'No data',
  } = props;

  const components = useComponents(props.components);
  const {
    Table,
    THead,
    TRHead,
    THHead,
    TBody,
    TRBody,
    TDBody,
    TRBodyEmpty,
    TDBodyEmpty,
    EmptyState,
    TFoot,
    TRFoot,
    THFoot,
  } = components;

  const table = useReactTable({
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    ...tableHookProps,
    data,
    columns,
  });

  const rows = table.getRowModel().rows;

  return (
    <Table className={className} components={components} table={table}>
      <THead components={components} table={table}>
        {table.getHeaderGroups().map((headerGroup) => (
          <TRHead
            key={headerGroup.id}
            components={components}
            table={table}
            headerGroup={headerGroup}
          >
            {headerGroup.headers.map((header) => (
              <THHead
                key={header.id}
                components={components}
                table={table}
                headerGroup={headerGroup}
                header={header}
              >
                {!header.isPlaceholder &&
                  flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
              </THHead>
            ))}
          </TRHead>
        ))}
      </THead>
      <TBody components={components} table={table}>
        {rows.map((row) => (
          <TRBody key={row.id} components={components} table={table} row={row}>
            {row.getVisibleCells().map((cell) => (
              <TDBody
                key={cell.id}
                components={components}
                table={table}
                row={row}
                cell={cell}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TDBody>
            ))}
          </TRBody>
        ))}
        {rows.length === 0 && (
          <TRBodyEmpty components={components} table={table}>
            <TDBodyEmpty
              components={components}
              table={table}
              colSpan={table.getAllFlatColumns().length}
            >
              <EmptyState components={components} table={table}>
                {emptyRowIcon}
                {emptyRowContent}
              </EmptyState>
            </TDBodyEmpty>
          </TRBodyEmpty>
        )}
      </TBody>
      <TFoot components={components} table={table}>
        {table.getFooterGroups().map((footerGroup) => (
          <TRFoot
            key={footerGroup.id}
            components={components}
            table={table}
            footerGroup={footerGroup}
          >
            {footerGroup.headers.map((footer) => (
              <THFoot
                key={footer.id}
                components={components}
                table={table}
                footerGroup={footerGroup}
                footer={footer}
              >
                {!footer.isPlaceholder &&
                  flexRender(
                    footer.column.columnDef.footer,
                    footer.getContext(),
                  )}
              </THFoot>
            ))}
          </TRFoot>
        ))}
      </TFoot>
    </Table>
  );
}

function useComponents<Data extends RowData>(
  componentsPartial: Partial<TableComponents<Data>> = {},
): TableComponents<Data> {
  const {
    Table = BaseTable,
    THead = BaseTHead,
    TRHead = BaseTRHead,
    THHead = BaseTHHead,
    TBody = BaseTBody,
    TRBody = BaseTRBody,
    TDBody = BaseTDBody,
    TRBodyEmpty = BaseTRBodyEmpty,
    TDBodyEmpty = BaseTDBodyEmpty,
    EmptyState = BaseEmptyState,
    TFoot = BaseTFoot,
    TRFoot = BaseTRFoot,
    THFoot = BaseTHFoot,
  } = componentsPartial;

  return useMemo<TableComponents<Data>>(
    () => ({
      Table,
      THead,
      TRHead,
      THHead,
      TBody,
      TRBody,
      TDBody,
      TRBodyEmpty,
      TDBodyEmpty,
      EmptyState,
      TFoot,
      TRFoot,
      THFoot,
    }),
    [
      Table,
      THead,
      TRHead,
      THHead,
      TBody,
      TRBody,
      TDBody,
      TRBodyEmpty,
      TDBodyEmpty,
      EmptyState,
      TFoot,
      TRFoot,
      THFoot,
    ],
  );
}
