import { Checkbox } from '@blueprintjs/core';
import type { CSSObject } from '@emotion/react';
import styled from '@emotion/styled';
import type { RowData } from '@tanstack/react-table';
import type { ComponentProps } from 'react';

import { Input2 } from '../../../../elements/Input2.js';
import type { BaseRowStyle } from '../../../../elements/ReactTable/ReactTable.js';
import ReactTable from '../../../../elements/ReactTable/ReactTable.js';
import type {
  TDBodyProps,
  TRBodyProps,
  TableComponents,
} from '../../../../elements/tanstack_table/index.ts';
import {
  TDBodyStyled,
  TRBodyStyled,
  Table,
} from '../../../../elements/tanstack_table/index.ts';

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
  }
`;

export const CellCheckbox = styled(Checkbox)`
  margin: 0;
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

export function NewTableSettings<Data extends RowData>(
  props: ComponentProps<typeof Table<Data>>,
) {
  const components: Partial<TableComponents<Data>> = {
    TRBody,
    TDBody,
    ...props.components,
  };

  return <Table<Data> {...props} components={components} />;
}

function TRBody<Data extends RowData>(props: TRBodyProps<Data>) {
  return <RowStyled {...props} />;
}
const RowStyled = styled(TRBodyStyled)`
  :hover {
    background-color: #f7f7f7;
  }
  :active {
    background-color: #f5f5f5;
  }
`;

function TDBody<Data extends RowData>(props: TDBodyProps<Data>) {
  return <CellStyled {...props} />;
}
const CellStyled = styled(TDBodyStyled)`
  padding: 0;
`;
