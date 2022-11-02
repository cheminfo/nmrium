import lodashGet from 'lodash/get';
import { useMemo, memo, useCallback, Fragment } from 'react';

import { useDispatch } from '../../context/DispatchContext';
import ReactTable from '../../elements/ReactTable/ReactTable';
import addCustomColumn, {
  CustomColumn,
} from '../../elements/ReactTable/utility/addCustomColumn';
import { useFormatNumberByNucleus } from '../../hooks/useFormatNumberByNucleus';
import { FILTER_SPECTRA_COLUMN } from '../../reducer/types/Types';
import evaluate from '../../utility/Evaluate';
import NoTableData from '../extra/placeholder/NoTableData';

import ColumnHeader from './ColumnHeader';

interface MultipleSpectraAnalysisTableProps {
  data: any;
  activeTab: string;
}

function MultipleSpectraAnalysisTable({
  data,
  activeTab,
}: MultipleSpectraAnalysisTableProps) {
  const format = useFormatNumberByNucleus(activeTab);

  const codeEvaluation = useMemo(() => {
    const code = lodashGet(data, 'code', '');
    return evaluate(code, data);
  }, [data]);

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
    const columns: CustomColumn[] = [
      {
        Header: '#',
        index: 0,
        Cell: ({ row }) => row.index + 1,
      },
    ];

    function cellHandler(row, columnKey, valueKey) {
      const value = row.original[columnKey][valueKey];
      const result =
        value instanceof Error ? (
          <span style={{ color: 'red' }}>{value.message}</span>
        ) : (
          format(value)
        );
      return result;
    }

    function headerHandler(columnData, columnKey) {
      return (
        <ColumnHeader
          charLabel={columnKey}
          data={columnData}
          onColumnFilter={(item) => columnFilterHandler(columnKey, item.key)}
          rangeLabel={
            columnData.from && columnData.to
              ? `${format(columnData.from)} - ${format(columnData.to)}`
              : ''
          }
        />
      );
    }

    if (data.columns) {
      for (const columnKey in data.columns) {
        const { valueKey, index: columnIndex } = data.columns[columnKey];
        addCustomColumn(columns, {
          index: columnIndex + 1,
          Cell: ({ row }) => cellHandler(row, columnKey, valueKey),
          Header: () => headerHandler(data.columns[columnKey], columnKey),
          id: columnKey,
        });
      }
    }
    return columns.sort((object1, object2) => object1.index - object2.index);
  }, [columnFilterHandler, data.columns, format]);

  return data.values && data.values.length > 0 ? (
    <Fragment>
      <ReactTable data={data.values} columns={tableColumns} />
      <div
        style={{
          width: '100%',
          padding: '10px',
        }}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: codeEvaluation }}
      />
    </Fragment>
  ) : (
    <NoTableData />
  );
}

export default memo(MultipleSpectraAnalysisTable);
