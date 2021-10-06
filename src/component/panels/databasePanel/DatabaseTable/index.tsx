import { useMemo, memo } from 'react';

import { usePreferences } from '../../../context/PreferencesContext';
import ReactTable from '../../../elements/ReactTable/ReactTable';
import setCustomColumn from '../../../elements/ReactTable/setCustomColumn';
import { getValue } from '../../../utility/LocalStorage';
import NoTableData from '../../extra/placeholder/NoTableData';
import { databaseDefaultValues } from '../../extra/preferences/defaultValues';

import NamesRenderer from './NamesRenderer';
import { RangesRenderer } from './RangesRenderer';

interface DatabaseTableProps {
  data: any;
}

function DatabaseTable({ data }: DatabaseTableProps) {
  const preferences = usePreferences();
  const initialColumns = useMemo(
    () => [
      {
        index: 1,
        Header: '#',
        width: '1%',
        minWidth: '24px',
        Cell: ({ row }) => row.index + 1,
      },
    ],
    [],
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
