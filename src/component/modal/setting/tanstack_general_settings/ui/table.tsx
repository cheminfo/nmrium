import { Checkbox } from '@blueprintjs/core';
import type { CSSObject } from '@emotion/react';
import styled from '@emotion/styled';
import type { ComponentProps } from 'react';

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
