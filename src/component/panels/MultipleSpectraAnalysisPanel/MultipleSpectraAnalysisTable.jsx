import lodash from 'lodash';
import React, { useMemo, memo, useCallback, Fragment } from 'react';

import { useDispatch } from '../../context/DispatchContext';
import { usePreferences } from '../../context/PreferencesContext';
import ReactTable from '../../elements/ReactTable/ReactTable';
import { FILTER_SPECTRA_COLUMN } from '../../reducer/types/Types';
import Eval from '../../utility/Evaluate';
import { useFormatNumberByNucleus } from '../../utility/FormatNumber';
import NoTableData from '../extra/placeholder/NoTableData';

import ColumnHeader from './ColumnHeader';

const MultipleSpectraAnalysisTable = memo(({ data, activeTab }) => {
  const format = useFormatNumberByNucleus(activeTab);
  const preferences = usePreferences();

  const codeEvaluation = useMemo(() => {
    const code = lodash.get(preferences, 'multipletAnalysis.code', '');
    return Eval(code, data);
  }, [data, preferences]);

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
          const value = row.original[key][valueKey];
          const result =
            value instanceof Error ? (
              <span style={{ color: 'red' }}>{value.message}</span>
            ) : (
              format(value)
            );
          return result;
        });
      });
    }
    const resultColumns = columns ? columns : initColumns;
    return resultColumns.sort(
      (object1, object2) => object1.index - object2.index,
    );
  }, [columnFilterHandler, data.columns, format]);

  return data.values && data.values.length > 0 ? (
    <Fragment>
      <ReactTable data={data.values} columns={tableColumns} />
      <div
        style={{
          // border: '0.55px solid #f3f3f3',
          width: '100%',
          // minHeight: '100px',
          padding: '10px',
        }}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: codeEvaluation }}
      />
    </Fragment>
  ) : (
    <NoTableData />
  );
});

export default MultipleSpectraAnalysisTable;
