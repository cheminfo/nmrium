import type {
  Cell,
  Header,
  HeaderGroup,
  Row,
  RowData,
  Table,
} from '@tanstack/react-table';
import type { ElementType, ReactNode } from 'react';

import {
  EmptyStateStyled,
  TBodyStyled,
  TDBodyEmptyStyled,
  TDBodyStyled,
  TFootStyled,
  THFootStyled,
  THHeadStyled,
  THeadStyled,
  TRBodyEmptyStyled,
  TRBodyStyled,
  TRFootStyled,
  TRHeadStyled,
  TableStyled,
} from './base_components_styled.ts';

export interface TableComponents<Data extends RowData> {
  Table: ElementType<BaseTableProps<Data>>;

  THead: ElementType<BaseTHeadProps<Data>>;
  TRHead: ElementType<BaseTRHeadProps<Data>>;
  THHead: ElementType<BaseTHHeadProps<Data>>;

  TBody: ElementType<BaseTBodyProps<Data>>;
  TRBody: ElementType<BaseTRBodyProps<Data>>;
  TDBody: ElementType<BaseTDBodyProps<Data>>;

  TRBodyEmpty: ElementType<BaseTRBodyEmptyProps<Data>>;
  TDBodyEmpty: ElementType<BaseTDBodyEmptyProps<Data>>;
  EmptyState: ElementType<BaseEmptyStateProps<Data>>;

  TFoot: ElementType<BaseTFootProps<Data>>;
  TRFoot: ElementType<BaseTRFootProps<Data>>;
  THFoot: ElementType<BaseTHFootProps<Data>>;
}

export interface BaseTableProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  children: ReactNode;
}

export function BaseTable<Data extends RowData>(props: BaseTableProps<Data>) {
  const { components, table, ...otherProps } = props;

  return <TableStyled {...otherProps} />;
}

export interface BaseTHeadProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  children: ReactNode;
}

export function BaseTHead<Data extends RowData>(props: BaseTHeadProps<Data>) {
  const { components, table, ...otherProps } = props;

  return <THeadStyled {...otherProps} />;
}

export interface BaseTRHeadProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  headerGroup: HeaderGroup<Data>;
  children: ReactNode;
}

export function BaseTRHead<Data extends RowData>(props: BaseTRHeadProps<Data>) {
  const { components, table, headerGroup, ...otherProps } = props;

  return <TRHeadStyled {...otherProps} />;
}

export interface BaseTHHeadProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  headerGroup: HeaderGroup<Data>;
  header: Header<Data, unknown>;
  children: ReactNode;
}

export function BaseTHHead<Data extends RowData>(props: BaseTHHeadProps<Data>) {
  const { components, table, headerGroup, header, ...otherProps } = props;

  return <THHeadStyled {...otherProps} />;
}

export interface BaseTBodyProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  children: ReactNode;
}

export function BaseTBody<Data extends RowData>(props: BaseTBodyProps<Data>) {
  const { components, table, ...otherProps } = props;

  return <TBodyStyled {...otherProps} />;
}

export interface BaseTRBodyProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  row: Row<Data>;
  children: ReactNode;
}

export function BaseTRBody<Data extends RowData>(props: BaseTRBodyProps<Data>) {
  const { components, table, row, ...otherProps } = props;

  return <TRBodyStyled {...otherProps} />;
}

export interface BaseTDBodyProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  row: Row<Data>;
  cell: Cell<Data, unknown>;
  children: ReactNode;
}

export function BaseTDBody<Data extends RowData>(props: BaseTDBodyProps<Data>) {
  const { components, table, row, cell, ...otherProps } = props;

  return <TDBodyStyled {...otherProps} />;
}

export interface BaseTRBodyEmptyProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  children: ReactNode;
}

export function BaseTRBodyEmpty<Data extends RowData>(
  props: BaseTRBodyEmptyProps<Data>,
) {
  const { components, table, ...otherProps } = props;

  return <TRBodyEmptyStyled {...otherProps} />;
}

export interface BaseTDBodyEmptyProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  children: ReactNode;
}

export function BaseTDBodyEmpty<Data extends RowData>(
  props: BaseTDBodyEmptyProps<Data>,
) {
  const { components, table, ...otherProps } = props;

  return <TDBodyEmptyStyled {...otherProps} />;
}

export interface BaseEmptyStateProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  children: ReactNode;
}

export function BaseEmptyState<Data extends RowData>(
  props: BaseEmptyStateProps<Data>,
) {
  const { components, table, ...otherProps } = props;

  return <EmptyStateStyled {...otherProps} />;
}

export interface BaseTFootProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  children: ReactNode;
}

export function BaseTFoot<Data extends RowData>(props: BaseTFootProps<Data>) {
  const { components, table, ...otherProps } = props;

  return <TFootStyled {...otherProps} />;
}

export interface BaseTRFootProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  footerGroup: HeaderGroup<Data>;
  children: ReactNode;
}

export function BaseTRFoot<Data extends RowData>(props: BaseTRFootProps<Data>) {
  const { components, table, footerGroup, ...otherProps } = props;

  return <TRFootStyled {...otherProps} />;
}

export interface BaseTHFootProps<Data extends RowData> {
  components: TableComponents<Data>;
  table: Table<Data>;
  footerGroup: HeaderGroup<Data>;
  footer: Header<Data, unknown>;
  children: ReactNode;
}

export function BaseTHFoot<Data extends RowData>(props: BaseTHFootProps<Data>) {
  const { components, table, footerGroup, footer, ...otherProps } = props;

  return <THFootStyled {...otherProps} />;
}
