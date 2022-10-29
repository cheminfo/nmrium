import { CSSProperties } from 'react';

export interface CustomColumn {
  index: number;
  id?: string;
  Header?: (() => JSX.Element) | string;
  sortType?: string;
  Cell?: (rowData: { row: { original: any; index: number } }) => any;
  accessor?: ((row?: any, index?: number) => any) | string;
  enableRowSpan?: boolean;
  style?: CSSProperties;
  extraParams?: any;
}

export default function addCustomColumn(array, options: CustomColumn) {
  const {
    index,
    Header = () => null,
    extraParams,
    accessor = null,
    Cell = null,
    sortType = 'basic',
    enableRowSpan = false,
    style = {},
    id,
  } = options || {};

  array.push({
    index,
    ...(id && { id }),
    ...(accessor && { accessor }),
    ...(Cell && { Cell }),
    Header,
    sortType,
    enableRowSpan,
    style,
    ...extraParams,
  });
}
