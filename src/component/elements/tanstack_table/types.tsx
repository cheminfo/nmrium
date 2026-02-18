import type {
  Cell,
  Header,
  HeaderGroup,
  Row,
  RowData,
  Table,
} from '@tanstack/react-table';
import type { ElementType, ReactNode } from 'react';

export interface TableComponents<Data extends RowData> {
  Table: ElementType<TableProps<Data>>;

  THead: ElementType<THeadProps<Data>>;
  TRHead: ElementType<TRHeadProps<Data>>;
  THHead: ElementType<THHeadProps<Data>>;

  TBody: ElementType<TBodyProps<Data>>;
  TRBody: ElementType<TRBodyProps<Data>>;
  TDBody: ElementType<TDBodyProps<Data>>;

  TRBodyEmpty: ElementType<TRBodyEmptyProps<Data>>;
  TDBodyEmpty: ElementType<TDBodyEmptyProps<Data>>;
  EmptyState: ElementType<EmptyStateProps<Data>>;

  TFoot: ElementType<TFootProps<Data>>;
  TRFoot: ElementType<TRFootProps<Data>>;
  THFoot: ElementType<THFootProps<Data>>;
}

export interface TableProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  children: ReactNode;
}

export interface THeadProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  children: ReactNode;
}

export interface TRHeadProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  headerGroup: HeaderGroup<Data>;
  children: ReactNode;
}

export interface THHeadProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  headerGroup: HeaderGroup<Data>;
  header: Header<Data, unknown>;
  children: ReactNode;
}

export interface TBodyProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  children: ReactNode;
}

export interface TRBodyProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  row: Row<Data>;
  children: ReactNode;
}

export interface TDBodyProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  row: Row<Data>;
  cell: Cell<Data, unknown>;
  children: ReactNode;
}

export interface TRBodyEmptyProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  children: ReactNode;
}

export interface TDBodyEmptyProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  colSpan: number;
  children: ReactNode;
}

export interface EmptyStateProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  children: ReactNode;
}

export interface TFootProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  children: ReactNode;
}

export interface TRFootProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  footerGroup: HeaderGroup<Data>;
  children: ReactNode;
}

export interface THFootProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  footerGroup: HeaderGroup<Data>;
  footer: Header<Data, unknown>;
  children: ReactNode;
}
