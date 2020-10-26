import React, { useMemo, memo } from 'react';
// import { FaRegTrashAlt } from 'react-icons/fa';

// import { useDispatch } from '../../context/DispatchContext';
import ReactTable from '../../elements/ReactTable/ReactTable';
import MultiAnalysisWrapper from '../../hoc/MultiAnalysisWrapper';
import { useFormatNumberByNucleus } from '../../utility/FormatNumber';
import NoTableData from '../extra/placeholder/NoTableData';

const MultipleSpectraAnalysisTable = memo(({ activeTab, spectraAanalysis }) => {
  // const dispatch = useDispatch();
  const format = useFormatNumberByNucleus(activeTab);
  // const deleteHandler = useCallback(
  //   (e, row) => {
  //     e.preventDefault();
  //     e.stopPropagation();
  //     const params = row.original;
  //   },
  //   [dispatch],
  // );
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
      // {
      //   Header: '',
      //   id: 'delete-button',
      //   index: 9999999,
      //   Cell: ({ row }) => (
      //     <button
      //       type="button"
      //       className="delete-button"
      //       onClick={(e) => deleteHandler(e, row)}
      //     >
      //       <FaRegTrashAlt />
      //     </button>
      //   ),
      // },
    ];

    const columns = initColumns;
    const setCustomColumn = (array, index, columnLabel, cellHandler) => {
      const labels = columnLabel.split('-');
      array.push({
        index: index,
        Header:
          labels.length === 2
            ? `${format(labels[0])} - ${format(labels[1])}`
            : columnLabel,
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
