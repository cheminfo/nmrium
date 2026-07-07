import { SvgNmrAssignment } from 'cheminfo-font';
import type { MouseEvent } from 'react';
import { memo, useCallback, useMemo } from 'react';

import { useDispatch } from '../../context/DispatchContext.js';
import type { TanStackTableColumn } from '../../elements/TanStackTable/TanStackTable.js';
import TanStackTable from '../../elements/TanStackTable/TanStackTable.js';

import type { AutoAssignmentsData } from './useAutoAssignments.js';

interface AutomaticAssignmentTableProps {
  data: AutoAssignmentsData[];
}

function AutomaticAssignmentTable({ data }: AutomaticAssignmentTableProps) {
  const dispatch = useDispatch();

  const assignHandler = useCallback(
    (event: MouseEvent, row: any) => {
      event.preventDefault();
      event.stopPropagation();

      dispatch({
        type: 'SET_AUTOMATIC_ASSIGNMENTS',
        payload: { assignments: row.original.assignment },
      });
    },
    [dispatch],
  );

  const COLUMNS = useMemo<Array<TanStackTableColumn<AutoAssignmentsData>>>(
    () => [
      {
        header: '#',
        accessorFn: (_, index) => index + 1,
        meta: { style: { width: '1%', maxWidth: '40px', minWidth: '40px' } },
      },
      {
        header: 'Score',
        accessorKey: 'score',
      },
      {
        header: '',
        meta: {
          style: {
            width: '1%',
            maxWidth: '24px',
            minWidth: '24px',
          },
        },
        id: 'assign-button',
        cell: ({ row }) => (
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
    <TanStackTable
      data={data}
      columns={COLUMNS}
      onClick={assignHandler}
      enableDefaultActiveRow
      emptyDataRowText="No Data"
    />
  );
}

export default memo(AutomaticAssignmentTable);
