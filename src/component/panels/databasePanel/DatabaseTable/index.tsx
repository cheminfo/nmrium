/** @jsxImportSource @emotion/react */
import { useMemo, memo, useCallback } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useDispatch } from '../../../context/DispatchContext';

import { usePreferences } from '../../../context/PreferencesContext';
import ReactTable from '../../../elements/ReactTable/ReactTable';
import setCustomColumn from '../../../elements/ReactTable/setCustomColumn';
import { RESURRECTING_SPECTRUM_FROM_RANGES } from '../../../reducer/types/Types';
import { getValue } from '../../../utility/LocalStorage';
import NoTableData from '../../extra/placeholder/NoTableData';
import { databaseDefaultValues } from '../../extra/preferences/defaultValues';

import NamesRenderer from './NamesRenderer';
import { RangesRenderer } from './RangesRenderer';

interface DatabaseTableProps {
  data: any;
  nucleus: string;
}

function DatabaseTable({ data, nucleus }: DatabaseTableProps) {
  const preferences = usePreferences();
  const dispatch = useDispatch();

  const resurrectHandler = useCallback(
    (data) => {
      const { ranges, solvent } = data.original;
      dispatch({
        type: RESURRECTING_SPECTRUM_FROM_RANGES,
        payload: { ranges, info: { solvent, nucleus } },
      });
    },
    [dispatch, nucleus],
  );

  const initialColumns = useMemo(
    () => [
      {
        index: 1,
        Header: '#',
        width: '1%',
        minWidth: '24px',
        Cell: ({ row }) => row.index + 1,
      },
      {
        index: 20,
        Header: '',
        width: '1%',
        maxWidth: '24px',
        minWidth: '24px',
        id: 'add-button',
        Cell: ({ row }) => (
          <button
            type="button"
            className="add-button"
            onClick={() => resurrectHandler(row)}
          >
            <FaPlus />
          </button>
        ),
      },
    ],
    [resurrectHandler],
  );

  const tableColumns = useMemo(() => {
    const databasePreferences = getValue(
      preferences,
      'formatting.panels.database',
      databaseDefaultValues,
    );

    let cols = [...initialColumns];

    if (databasePreferences.showNames) {
      setCustomColumn(cols, {
        index: 2,
        columnLabel: 'names',
        accessor: (row) => row.names[0],
        Cell: ({ row }) => <NamesRenderer names={row?.original.names} />,
      });
    }

    if (databasePreferences.showRanges) {
      setCustomColumn(cols, {
        index: 3,
        columnLabel: 'ranges',
        Cell: ({ row }) => <RangesRenderer ranges={row?.original.ranges} />,
      });
    }

    if (databasePreferences.showSolvent) {
      setCustomColumn(cols, {
        index: 4,
        columnLabel: 'solvent',
        Cell: ({ row }) => <RangesRenderer ranges={row?.original.solvent} />,
      });
    }
    return cols.sort((object1, object2) => object1.index - object2.index);
  }, [initialColumns, preferences]);

  return data && data.length > 0 ? (
    <ReactTable data={data} columns={tableColumns} />
  ) : (
    <NoTableData />
  );
}

export default memo(DatabaseTable);
