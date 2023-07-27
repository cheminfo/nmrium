import { useMemo, Fragment } from 'react';

import { SpectraAnalysisData } from '../../../data/data1d/multipleSpectraAnalysis';
import { useDispatch } from '../../context/DispatchContext';
import { usePreferences } from '../../context/PreferencesContext';
import ReactTable from '../../elements/ReactTable/ReactTable';
import addCustomColumn, {
  CustomColumn,
} from '../../elements/ReactTable/utility/addCustomColumn';
import { useFormatNumberByNucleus } from '../../hooks/useFormatNumberByNucleus';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import evaluate from '../../utility/Evaluate';
import NoTableData from '../extra/placeholder/NoTableData';

import AnalysisCell from './base/AnalysisCell';
import AnalysisColumnHeader from './base/AnalysisColumnHeader';

interface MultipleSpectraAnalysisTableProps {
  data: SpectraAnalysisData;
  activeTab: string;
  resortSpectra: boolean;
}

function MultipleSpectraAnalysisTable({
  data,
  activeTab,
  resortSpectra,
}: MultipleSpectraAnalysisTableProps) {
  const format = useFormatNumberByNucleus(activeTab);
  const dispatch = useDispatch();
  const { dispatch: dispatchPreferences } = usePreferences();
  const panelPreferences = usePanelPreferences(
    'multipleSpectraAnalysis',
    activeTab,
  );

  const codeEvaluation = useMemo(() => {
    const code = data.options.code || '';
    return evaluate(code, data as any);
  }, [data]);

  const tableColumns = useMemo(() => {
    function handleChangeColumnValueKey(columnKey, valueKey) {
      dispatchPreferences({
        type: 'CHANGE_ANALYSIS_COLUMN_VALUE_KEY',
        payload: {
          columnKey,
          valueKey,
          nucleus: activeTab,
        },
      });
    }
    function handleDeleteColumn(columnKey) {
      dispatchPreferences({
        type: 'DELETE_ANALYSIS_COLUMN',
        payload: {
          columnKey,
          nucleus: activeTab,
        },
      });
    }

    const columns: Array<CustomColumn<any>> = [
      {
        Header: '#',
        index: 0,
        accessor: (_, index) => index !== undefined && index + 1,
      },
    ];

    function cellHandler(row, columnKey, valueKey) {
      const value = row.original[columnKey][valueKey];
      return (
        <AnalysisCell
          value={value}
          columnKey={columnKey}
          activeTab={activeTab}
        />
      );
    }

    function headerHandler(columnData, columnKey) {
      return (
        <AnalysisColumnHeader
          onDelete={() => handleDeleteColumn(columnKey)}
          columnKey={columnKey}
          data={columnData}
          onColumnFilter={(item) =>
            handleChangeColumnValueKey(columnKey, item.key)
          }
          rangeLabel={
            columnData.from && columnData.to
              ? `${format(columnData.from)} - ${format(columnData.to)}`
              : ''
          }
        />
      );
    }

    if (panelPreferences?.analysisOptions?.columns) {
      const analysisColumns = panelPreferences?.analysisOptions?.columns;
      for (const columnKey in analysisColumns) {
        const { valueKey, index: columnIndex } = analysisColumns[columnKey];
        addCustomColumn(columns, {
          index: columnIndex + 1,
          Header: () => headerHandler(analysisColumns[columnKey], columnKey),
          id: columnKey,
          accessor: (row) => row[columnKey][valueKey],
          Cell: ({ row }) => cellHandler(row, columnKey, valueKey),
          style: { padding: 0 },
        });
      }
    }
    return columns.sort((object1, object2) => object1.index - object2.index);
  }, [
    activeTab,
    dispatchPreferences,
    format,
    panelPreferences?.analysisOptions?.columns,
  ]);

  function handleSortEnd(data) {
    if (resortSpectra) {
      dispatch({
        type: 'ORDER_MULTIPLE_SPECTRA_ANALYSIS',
        payload: {
          data,
        },
      });
    }
  }
  return data?.values.length > 0 ? (
    <Fragment>
      <ReactTable
        data={data.values}
        columns={tableColumns}
        onSortEnd={handleSortEnd}
      />
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

export default MultipleSpectraAnalysisTable;
