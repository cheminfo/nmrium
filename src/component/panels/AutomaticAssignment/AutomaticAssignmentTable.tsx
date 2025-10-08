import { SvgNmrAssignment } from 'cheminfo-font';
import { memo, useCallback, useMemo } from 'react';
import type { CellProps } from 'react-table';

import { useDispatch } from '../../context/DispatchContext.js';
import ReactTable from '../../elements/ReactTable/ReactTable.js';
import type { CustomColumn } from '../../elements/ReactTable/utility/addCustomColumn.js';

import type { AutoAssignmentsData } from './useAutoAssignments.js';

interface AutomaticAssignmentTableProps {
  data: AutoAssignmentsData[];
}

function AutomaticAssignmentTable({ data }: AutomaticAssignmentTableProps) {
  const dispatch = useDispatch();

  const assignHandler = useCallback(
    (e: any, row: any) => {
      e.preventDefault();
      e.stopPropagation();

      dispatch({
        type: 'SET_AUTOMATIC_ASSIGNMENTS',
        payload: { assignments: row.original.assignment },
      });
    },
    [dispatch],
  );

  const COLUMNS = useMemo<Array<CustomColumn<AutoAssignmentsData>>>(
    () => [
      {
        index: 1,
        Header: '#',
        accessor: (_, index) => index + 1,
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
        Cell: ({ row }: CellProps<AutoAssignmentsData>) => (
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

  return (
    <ReactTable
      data={data}
      columns={COLUMNS}
      onClick={assignHandler}
      enableDefaultActiveRow
      emptyDataRowText="No Data"
    />
  );
}

export default memo(AutomaticAssignmentTable);
