import type { RowData } from '@tanstack/react-table';

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
import type {
  EmptyStateProps,
  TBodyProps,
  TDBodyEmptyProps,
  TDBodyProps,
  TFootProps,
  THFootProps,
  THHeadProps,
  THeadProps,
  TRBodyEmptyProps,
  TRBodyProps,
  TRFootProps,
  TRHeadProps,
  TableProps,
} from './types.tsx';

export function BaseTable<Data extends RowData>(props: TableProps<Data>) {
  const { components, table, ...otherProps } = props;

  return <TableStyled {...otherProps} />;
}

export function BaseTHead<Data extends RowData>(props: THeadProps<Data>) {
  const { components, table, ...otherProps } = props;

  return <THeadStyled {...otherProps} />;
}

export function BaseTRHead<Data extends RowData>(props: TRHeadProps<Data>) {
  const { components, table, headerGroup, ...otherProps } = props;

  return <TRHeadStyled {...otherProps} />;
}

export function BaseTHHead<Data extends RowData>(props: THHeadProps<Data>) {
  const { components, table, headerGroup, header, ...otherProps } = props;

  return <THHeadStyled {...otherProps} />;
}

export function BaseTBody<Data extends RowData>(props: TBodyProps<Data>) {
  const { components, table, ...otherProps } = props;

  return <TBodyStyled {...otherProps} />;
}

export function BaseTRBody<Data extends RowData>(props: TRBodyProps<Data>) {
  const { components, table, row, ...otherProps } = props;

  return <TRBodyStyled {...otherProps} />;
}

export function BaseTDBody<Data extends RowData>(props: TDBodyProps<Data>) {
  const { components, table, row, cell, ...otherProps } = props;

  return <TDBodyStyled {...otherProps} />;
}

export function BaseTRBodyEmpty<Data extends RowData>(
  props: TRBodyEmptyProps<Data>,
) {
  const { components, table, ...otherProps } = props;

  return <TRBodyEmptyStyled {...otherProps} />;
}

export function BaseTDBodyEmpty<Data extends RowData>(
  props: TDBodyEmptyProps<Data>,
) {
  const { components, table, ...otherProps } = props;

  return <TDBodyEmptyStyled {...otherProps} />;
}

export function BaseEmptyState<Data extends RowData>(
  props: EmptyStateProps<Data>,
) {
  const { components, table, ...otherProps } = props;

  return <EmptyStateStyled {...otherProps} />;
}

export function BaseTFoot<Data extends RowData>(props: TFootProps<Data>) {
  const { components, table, ...otherProps } = props;

  return <TFootStyled {...otherProps} />;
}

export function BaseTRFoot<Data extends RowData>(props: TRFootProps<Data>) {
  const { components, table, footerGroup, ...otherProps } = props;

  return <TRFootStyled {...otherProps} />;
}

export function BaseTHFoot<Data extends RowData>(props: THFootProps<Data>) {
  const { components, table, footerGroup, footer, ...otherProps } = props;

  return <THFootStyled {...otherProps} />;
}
