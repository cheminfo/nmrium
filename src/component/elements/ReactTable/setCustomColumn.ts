interface CustomColumn {
  index: number;
  columnLabel: string;
  sortType?: string;
  Cell?: (rowData: { row?: { original: any } }) => any;
  accessor?: (row?: any) => any | string;
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
  } = options || {};

  array.push({
    index,
    ...{ ...(accessor ? { accessor } : {}) },
    ...{ ...(Cell ? { Cell } : {}) },
    Header: columnLabel,
    sortType,
    ...extraParams,
  });
}
