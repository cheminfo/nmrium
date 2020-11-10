import React, { useMemo, memo, useCallback } from 'react';

import { useDispatch } from '../../context/DispatchContext';
import ReactTable from '../../elements/ReactTable/ReactTable';
import { FILTER_SPECTRA_COLUMN } from '../../reducer/types/Types';
import { useFormatNumberByNucleus } from '../../utility/FormatNumber';
import NoTableData from '../extra/placeholder/NoTableData';

import ColumnHeader from './ColumnHeader';

const MultipleSpectraAnalysisTable = memo(({ data, activeTab }) => {
  const format = useFormatNumberByNucleus(activeTab);

  const dispatch = useDispatch();

  const columnFilterHandler = useCallback(
    (columnKey, valueKey) => {
      dispatch({
        type: FILTER_SPECTRA_COLUMN,
        payload: {
          columnKey,
          valueKey,
        },
      });
    },
    [dispatch],
  );

  const tableColumns = useMemo(() => {
    const initColumns = [
      {
        Header: '#',
        index: 0,
        Cell: ({ row }) => row.index + 1,
      },
    ];

    const columns = initColumns;
    const setCustomColumn = (array, index, columnLabel, cellHandler) => {
      const columnData = data.columns[columnLabel];
      array.push({
        index: index,
        Header: () => (
          <ColumnHeader
            charLabel={columnLabel}
            data={columnData}
            onColumnFilter={(valueKey) =>
              columnFilterHandler(columnLabel, valueKey)
            }
            rangeLabel={
              columnData.from && columnData.to
                ? `${format(columnData.from)} - ${format(columnData.to)}`
                : ''
            }
          />
        ),
        id: columnLabel,
        sortType: 'basic',
        Cell: ({ row }) => cellHandler(row),
      });
    };
    if (data.columns) {
      Object.keys(data.columns).forEach((key) => {
        const { valueKey, index: columnIndex } = data.columns[key];
        setCustomColumn(columns, columnIndex + 1, key, (row) => {
          return format(
            row.original[key] && row.original[key][valueKey]
              ? row.original[key][valueKey]
              : '',
          );
        });
      });
    }
    const resultColumns = columns ? columns : initColumns;
    return resultColumns.sort(
      (object1, object2) => object1.index - object2.index,
    );
  }, [columnFilterHandler, data.columns, format]);

  return data.values && data.values.length > 0 ? (
    <ReactTable data={data.values} columns={tableColumns} />
  ) : (
    <NoTableData />
  );
});

export default MultipleSpectraAnalysisTable;
