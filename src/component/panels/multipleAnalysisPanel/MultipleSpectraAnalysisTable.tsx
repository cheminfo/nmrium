import { Fragment, useMemo } from 'react';
import type { CellProps, Row } from 'react-table';

import type { SpectraAnalysisData } from '../../../data/data1d/multipleSpectraAnalysis.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useSortSpectra } from '../../context/SortSpectraContext.js';
import { EmptyText } from '../../elements/EmptyText.js';
import ReactTable from '../../elements/ReactTable/ReactTable.js';
import type { CustomColumn } from '../../elements/ReactTable/utility/addCustomColumn.js';
import addCustomColumn from '../../elements/ReactTable/utility/addCustomColumn.js';
import { useFormatNumberByNucleus } from '../../hooks/useFormatNumberByNucleus.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import evaluate from '../../utility/Evaluate.js';

import AnalysisCell from './base/AnalysisCell.js';
import AnalysisColumnHeader from './base/AnalysisColumnHeader.js';

interface MultipleSpectraAnalysisTableProps {
  data: SpectraAnalysisData;
  activeTab: string;
  resortSpectra: boolean;
}

type ValueType = SpectraAnalysisData['values'][number];

function MultipleSpectraAnalysisTable({
  data,
  activeTab,
  resortSpectra,
}: MultipleSpectraAnalysisTableProps) {
  const format = useFormatNumberByNucleus(activeTab);
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
    function handleChangeColumnValueKey(columnKey: any, valueKey: any) {
      dispatchPreferences({
        type: 'CHANGE_ANALYSIS_COLUMN_VALUE_KEY',
        payload: {
          columnKey,
          valueKey,
          nucleus: activeTab,
        },
      });
    }
    function handleDeleteColumn(columnKey: any) {
      dispatchPreferences({
        type: 'DELETE_ANALYSIS_COLUMN',
        payload: {
          columnKey,
          nucleus: activeTab,
        },
      });
    }

    const columns: Array<CustomColumn<ValueType>> = [
      {
        Header: '#',
        index: 0,
        accessor: (_, index) => index !== undefined && index + 1,
      },
    ];

    function cellHandler(row: Row<ValueType>, columnKey: string) {
      const value = row.original[columnKey].value;
      return (
        <AnalysisCell
          value={value}
          columnKey={columnKey}
          activeTab={activeTab}
        />
      );
    }

    function headerHandler(columnData: any, columnKey: any) {
      return (
        <AnalysisColumnHeader
          onDelete={() => handleDeleteColumn(columnKey)}
          columnKey={columnKey}
          data={columnData}
          onColumnFilter={(value) =>
            handleChangeColumnValueKey(columnKey, value)
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
        const { index: columnIndex } = analysisColumns[columnKey];
        addCustomColumn<ValueType>(columns, {
          index: columnIndex + 1,
          Header: () => headerHandler(analysisColumns[columnKey], columnKey),
          id: columnKey,
          accessor: (row) => {
            return row[columnKey].value;
          },
          Cell: (cell: CellProps<ValueType>) =>
            cellHandler(cell.row, columnKey),
          style: { padding: 0 },
        });
      }
    }
    columns.sort((object1, object2) => object1.index - object2.index);
    return columns;
  }, [
    activeTab,
    dispatchPreferences,
    format,
    panelPreferences?.analysisOptions?.columns,
  ]);

  const { sort, reset } = useSortSpectra();

  function handleSortEnd(data: any, isTableSorted?: boolean) {
    if (resortSpectra) {
      if (isTableSorted) {
        sort({
          sortType: 'sortByReferenceIndexes',
          sortByReferences: data.map((analysisData: any) => {
            const key = Object.keys(analysisData)[0];
            const id = analysisData[key].SID;
            return { id };
          }),
        });
      } else {
        reset();
      }
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
    <EmptyText text="No data" />
  );
}

export default MultipleSpectraAnalysisTable;
