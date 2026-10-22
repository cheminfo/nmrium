import { Tag } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { GroupedDiaID } from 'openchemlib-utils';
import { useMemo } from 'react';

import { useChartData } from '../../context/ChartContext.js';
import IsotopesViewer from '../../elements/IsotopesViewer.js';
import {
  TanStackTable,
  createTanStackColumnHelper,
} from '../../elements/tanstack_table/index.js';

import { AssignmentAtomCell } from './table-cells/AssignmentAtomCell.js';
import { AssignmentChemicalShiftCell } from './table-cells/AssignmentChemicalShiftCell.js';
import { AssignmentLabelCell } from './table-cells/AssignmentLabelCell.js';
import type { AssignmentListRow } from './utilities/atomGroupsToAssignmentRows.js';
import {
  atomGroupsToAssignmentRows,
  getHydrogenIDsByParent,
  getVisibleAssignmentRows,
} from './utilities/atomGroupsToAssignmentRows.js';
import { getAssignedAtomCounts } from './utilities/getAssignedAtomCounts.js';
import { getSignalsByNucleus } from './utilities/getSignalsByNucleus.js';
import type { SignalsByOclID } from './utilities/types.js';

interface MoleculeAssignmentTableProps {
  groups: GroupedDiaID[];
  expandedGroups: ReadonlySet<string>;
  onToggleRow: (id: string) => void;
}

const columnHelper = createTanStackColumnHelper<AssignmentListRow>();

const SpectrumHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  white-space: nowrap;
`;

interface SpectrumColumnHeaderProps {
  nucleus: string;
  groups: GroupedDiaID[];
  signalsByOclID: SignalsByOclID;
}

function SpectrumColumnHeader({
  nucleus,
  groups,
  signalsByOclID,
}: SpectrumColumnHeaderProps) {
  const counts = getAssignedAtomCounts(groups, signalsByOclID, nucleus);
  const atomLabel = nucleus.replace(/^\d+/, '');
  const tooltip = `${counts.assigned} of ${counts.total} ${atomLabel} atoms assigned.`;
  // Green means every atom has an assignment link, not a verified assignment.
  const isFullyAssigned = counts.total > 0 && counts.assigned === counts.total;
  return (
    <SpectrumHeader>
      <IsotopesViewer value={nucleus} />
      <span>&delta;</span>
      <Tag
        minimal
        intent={isFullyAssigned ? 'success' : 'danger'}
        title={tooltip}
      >
        {counts.assigned}/{counts.total}
      </Tag>
    </SpectrumHeader>
  );
}

export function MoleculeAssignmentTable(props: MoleculeAssignmentTableProps) {
  const { groups, expandedGroups, onToggleRow } = props;
  const { data } = useChartData();
  // Build once per data change.
  // headers and cells share the same nucleus lookup.
  const signalsByNucleus = useMemo(() => getSignalsByNucleus(data), [data]);
  // Keep the complete hierarchy for assignments.
  // Expansion Only hides rows.
  const allRows = useMemo(
    () => atomGroupsToAssignmentRows(groups, true),
    [groups],
  );
  const hydrogenIDsByParent = useMemo(
    () => getHydrogenIDsByParent(allRows),
    [allRows],
  );
  const rows = useMemo(
    () => getVisibleAssignmentRows(allRows, expandedGroups),
    [allRows, expandedGroups],
  );
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
        cell: ({ row }) => (
          <AssignmentLabelCell
            value={row.original.atomNumbers}
            hydrogenValue={row.original.hydrogenAtomNumbers}
            isExpanded={row.original.isExpanded}
          />
        ),
      },
      {
        header: 'Atom labels',
        accessorKey: 'atomLabels',
        enableSorting: false,
        cell: ({ row }) => (
          <AssignmentLabelCell
            value={row.original.atomLabels}
            hydrogenValue={row.original.hydrogenAtomLabels}
            isExpanded={row.original.isExpanded}
          />
        ),
      },
      // One column per nucleus, combining assignments from all of its spectra.
      ...Array.from(signalsByNucleus).flatMap(([nucleus, signalsByOclID]) =>
        columnHelper.columns([
          {
            header: () => (
              <SpectrumColumnHeader
                nucleus={nucleus}
                groups={groups}
                signalsByOclID={signalsByOclID}
              />
            ),
            id: nucleus,
            enableSorting: false,
            cell: ({ row }) => (
              <AssignmentChemicalShiftCell
                options={{
                  row: row.original,
                  hydrogenIDsByParent,
                  signalsByOclID,
                }}
              />
            ),
          },
        ]),
      ),
    ]);
  }, [groups, onToggleRow, signalsByNucleus, hydrogenIDsByParent]);

  function getHighlightIDs(row: AssignmentListRow): string[] {
    return [row.id, ...(hydrogenIDsByParent.get(row.id) ?? [])];
  }

  return (
    <TanStackTable
      data={rows}
      columns={columns}
      getHighlightIDs={getHighlightIDs}
      highlightedSource="ASSIGNMENT_TABLE"
      style={{ height: '100%' }}
      rowStyle={({ original }) => ({
        base: {
          backgroundColor:
            !original.isHydrogen && original.isExpanded ? '#f2f2f2' : 'white',
        },
      })}
      emptyDataRowText="No atom groups to display"
    />
  );
}
