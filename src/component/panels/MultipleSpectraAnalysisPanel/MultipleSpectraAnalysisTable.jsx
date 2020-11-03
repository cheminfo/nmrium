import React, { useMemo, memo } from 'react';

import ReactTable from '../../elements/ReactTable/ReactTable';
import MultiAnalysisWrapper from '../../hoc/MultiAnalysisWrapper';
import { useFormatNumberByNucleus } from '../../utility/FormatNumber';
import NoTableData from '../extra/placeholder/NoTableData';

import ColumnHeader from './ColumnHeader';

const MultipleSpectraAnalysisTable = memo(({ activeTab, spectraAanalysis }) => {
  const format = useFormatNumberByNucleus(activeTab);

  const data = useMemo(() => {
    const result = Object.values(
      (spectraAanalysis[activeTab] && spectraAanalysis[activeTab].values) || [],
    );
    return result;
  }, [activeTab, spectraAanalysis]);

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
      const row = data[0][columnLabel];
      array.push({
        index: index,
        Header: () => (
          <ColumnHeader
            charLabel={columnLabel}
            rangeLabel={`${format(row.from)} - ${format(row.to)}`}
          />
        ),
        id: columnLabel,
        sortType: 'basic',
        Cell: ({ row }) => cellHandler(row),
      });
    };
    if (data[0]) {
      Object.keys(data[0]).forEach((key, index) => {
        if (!['key'].includes(key)) {
          setCustomColumn(columns, index + 1, key, (row) => {
            return format(
              row.original[key] && row.original[key].relative
                ? row.original[key].relative
                : '',
            );
          });
        }
      });
    }
    const resultColumns = columns ? columns : initColumns;
    return resultColumns.sort(
      (object1, object2) => object1.index - object2.index,
    );
  }, [data, format]);

  return data && data.length > 0 ? (
    <ReactTable data={data} columns={tableColumns} />
  ) : (
    <NoTableData />
  );
});

export default MultiAnalysisWrapper(MultipleSpectraAnalysisTable);
