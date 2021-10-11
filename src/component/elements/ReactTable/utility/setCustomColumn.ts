interface CustomColumn {
  index: number;
  columnLabel: string;
  sortType?: string;
  Cell?: (rowData: { row?: { original: any } }) => any;
  accessor?: ((row?: any) => any) | string;
  enableRowSpan?: boolean;
  extraParams?: any;
}

export default function setCustomColumn(array, options: CustomColumn) {
  const {
    index,
    columnLabel,
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
    Header: columnLabel,
    sortType,
    enableRowSpan,
    ...extraParams,
  });
}
