import styled from '@emotion/styled';
import { useMemo } from 'react';

import {
  TanStackTable,
  createTanStackColumnHelper,
} from '../../elements/tanstack_table/index.js';

import { AssignmentAtomCell } from './AssignmentAtomCell.js';
import type { AssignmentListRow } from './atomGroupsToAssignmentRows.js';

interface MoleculeAssignmentTableProps {
  rows: AssignmentListRow[];
  onToggleRow: (id: string) => void;
}

const columnHelper = createTanStackColumnHelper<AssignmentListRow>();

const Container = styled.section`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  table {
    border-top: 0;
  }

  table thead th {
    background-color: #e0e0e0;
    color: #333;
    border-bottom-color: #bdbdbd;
    box-shadow: inset 0 1px 0 #bdbdbd;
    z-index: 1;
  }
`;

export function MoleculeAssignmentTable(props: MoleculeAssignmentTableProps) {
  const { rows, onToggleRow } = props;
  const columns = useMemo(() => {
    return columnHelper.columns([
      {
        header: 'Atom',
        accessorKey: 'atomLabel',
        meta: { style: { width: '80px' } },
        enableSorting: false,
        cell: ({ row }) => (
          <AssignmentAtomCell row={row.original} onToggle={onToggleRow} />
        ),
      },
      {
        header: 'Atom numbers',
        accessorKey: 'atomNumbers',
        enableSorting: false,
      },
      {
        header: 'Atom labels',
        accessorKey: 'atomLabels',
        enableSorting: false,
      },
    ]);
  }, [onToggleRow]);

  return (
    <Container>
      <TanStackTable
        data={rows}
        columns={columns}
        style={{ flex: 1, minHeight: 0 }}
        rowStyle={({ original }) => ({
          base: {
            backgroundColor: original.isExpanded ? '#f2f2f2' : 'white',
          },
        })}
        emptyDataRowText="No atom groups to display"
      />
    </Container>
  );
}
