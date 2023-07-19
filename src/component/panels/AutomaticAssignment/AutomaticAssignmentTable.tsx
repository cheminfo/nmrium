import { SvgNmrAssignment } from 'cheminfo-font';
import { useCallback, useMemo, memo } from 'react';

import { useDispatch } from '../../context/DispatchContext';
import ReactTable from '../../elements/ReactTable/ReactTable';
import { CustomColumn } from '../../elements/ReactTable/utility/addCustomColumn';

import { AutoAssignmentsData } from './useAutoAssignments';

interface AutomaticAssignmentTableProps {
  data: AutoAssignmentsData[];
}

function AutomaticAssignmentTable({ data }: AutomaticAssignmentTableProps) {
  const dispatch = useDispatch();

  const assignHandler = useCallback(
    (e, row) => {
      e.preventDefault();
      e.stopPropagation();

      dispatch({
        type: 'SET_AUTOMATIC_ASSIGNMENTS',
        payload: { assignments: row.original.assignment },
      });
    },
    [dispatch],
  );

  const COLUMNS: Array<CustomColumn<AutoAssignmentsData>> = useMemo(
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
