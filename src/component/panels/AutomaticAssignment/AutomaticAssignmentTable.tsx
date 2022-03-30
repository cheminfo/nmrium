import { SvgNmrAssignment } from 'cheminfo-font';
import { useCallback, useMemo, memo } from 'react';

import ReactTable from '../../elements/ReactTable/ReactTable';
import { CustomColumn } from '../../elements/ReactTable/utility/addCustomColumn';
import NoTableData from '../extra/placeholder/NoTableData';

import { AutoAssignmentsData } from './useGetAssignments';

interface AutomaticAssignmentTableProps {
  data: AutoAssignmentsData[];
}

function PeaksTable({ data }: AutomaticAssignmentTableProps) {
  const assignHandler = useCallback((e, row) => {
    e.preventDefault();
    e.stopPropagation();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const params = row.original;
  }, []);

  const COLUMNS: CustomColumn[] = useMemo(
    () => [
      {
        index: 1,
        Header: '#',
        Cell: ({ row }) => row.index + 1,
        style: { width: '1%', maxWidth: '40px', minWidth: '40px' },
      },
      {
        index: 2,
        Header: 'Score',
        accessor: 'score',
      },
      {
        index: 3,
        Header: '',
        style: {
          width: '1%',
          maxWidth: '24px',
          minWidth: '24px',
        },
        id: 'assign-button',
        Cell: ({ row }) => (
          <button
            type="button"
            className="assign-button"
            onClick={(e) => assignHandler(e, row)}
          >
            <SvgNmrAssignment />
          </button>
        ),
      },
    ],
    [assignHandler],
  );

  return data && data.length > 0 ? (
    <ReactTable data={data} columns={COLUMNS} />
  ) : (
    <NoTableData />
  );
}

export default memo(PeaksTable);
