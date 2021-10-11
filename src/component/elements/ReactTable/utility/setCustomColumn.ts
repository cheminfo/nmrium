export interface CustomColumn {
  index: number;
  Header: string;
  sortType?: string;
  Cell?: (rowData: { row?: { original: any } }) => any;
  accessor?: ((row?: any) => any) | string;
  enableRowSpan?: boolean;
  extraParams?: any;
}

export default function setCustomColumn(array, options: CustomColumn) {
  const {
    index,
    Header,
    extraParams,
    accessor = null,
    Cell = null,
    sortType = 'basic',
    enableRowSpan = false,
  } = options || {};

  array.push({
    index,
    ...{ ...(accessor ? { accessor } : {}) },
    ...{ ...(Cell ? { Cell } : {}) },
    Header,
    sortType,
    enableRowSpan,
    ...extraParams,
  });
}
