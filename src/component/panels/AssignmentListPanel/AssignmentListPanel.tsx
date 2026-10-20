import { Switch } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { Molecule } from 'openchemlib';
import type { GroupedDiaID } from 'openchemlib-utils';
import { TopicMolecule } from 'openchemlib-utils';
import { useMemo, useState } from 'react';
import { PanelHeader } from 'react-science/ui';

import type { StateMoleculeExtended } from '../../../data/molecules/Molecule.js';
import { useChartData } from '../../context/ChartContext.js';
import { EmptyText } from '../../elements/EmptyText.js';
import Select from '../../elements/Select.js';
import { TablePanel } from '../extra/BasicPanelStyle.js';

import { MoleculeAssignmentTable } from './MoleculeAssignmentTable.js';
import { atomGroupsToAssignmentRows } from './atomGroupsToAssignmentRows.js';

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: flex-start;
  gap: 8px;
  min-height: 0;
  min-width: 0;
  padding: 4px;

  label {
    flex-shrink: 0;
    white-space: nowrap;
  }
`;

interface MoleculeAssignmentData {
  molecule: StateMoleculeExtended;
  groups: GroupedDiaID[];
  expandableGroupIds: string[];
}

function getMoleculeOptions(moleculeAssignments: MoleculeAssignmentData[]) {
  return moleculeAssignments.map(({ molecule }) => ({
    value: molecule.id,
    label: molecule.label,
  }));
}

function toggleExpandedRows(
  expandedRows: ReadonlySet<string>,
  keys: readonly string[],
): Set<string> {
  const shouldCollapse = keys.every((key) => expandedRows.has(key));
  const next = new Set(expandedRows);
  for (const key of keys) {
    if (shouldCollapse) {
      next.delete(key);
    } else {
      next.add(key);
    }
  }
  return next;
}

function useMoleculeAssignments(molecules: StateMoleculeExtended[]) {
  const [selectedMoleculeId, selectMolecule] = useState<string>();
  const moleculeAssignments = useMemo<MoleculeAssignmentData[]>(
    () =>
      molecules.map((molecule) => {
        const topicMolecule = new TopicMolecule(
          Molecule.fromMolfile(molecule.molfile),
        );
        const groups = topicMolecule.getGroupedDiastereotopicAtomIDs() ?? [];
        return {
          molecule,
          groups,
          expandableGroupIds: atomGroupsToAssignmentRows(groups, false)
            .filter((row) => row.hasChildren)
            .map((row) => row.id),
        };
      }),
    [molecules],
  );
  const activeAssignment =
    moleculeAssignments.find(
      ({ molecule }) => molecule.id === selectedMoleculeId,
    ) ?? moleculeAssignments[0];

  return { moleculeAssignments, activeAssignment, selectMolecule };
}

function useAssignmentExpansion(
  activeAssignment: MoleculeAssignmentData | undefined,
) {
  const [expandedGroupsByMolecule, setExpandedGroupsByMolecule] = useState<
    ReadonlyMap<string, ReadonlySet<string>>
  >(() => new Map());
  const moleculeId = activeAssignment?.molecule.id;
  const expandableGroupIds = activeAssignment?.expandableGroupIds ?? [];
  const expandedGroups =
    moleculeId === undefined
      ? new Set<string>()
      : (expandedGroupsByMolecule.get(moleculeId) ?? new Set<string>());
  const allExpanded =
    expandableGroupIds.length > 0 &&
    expandableGroupIds.every((id) => expandedGroups.has(id));

  function toggleRows(groupIds: readonly string[]) {
    if (moleculeId === undefined) return;
    setExpandedGroupsByMolecule((previous) => {
      const next = new Map(previous);
      next.set(
        moleculeId,
        toggleExpandedRows(previous.get(moleculeId) ?? new Set(), groupIds),
      );
      return next;
    });
  }

  function toggleRow(groupId: string) {
    toggleRows([groupId]);
  }

  function toggleAllRows() {
    toggleRows(expandableGroupIds);
  }

  return {
    expandedGroups,
    allExpanded,
    canExpand: expandableGroupIds.length > 0,
    toggleRow,
    toggleAllRows,
  };
}

export function AssignmentListPanel() {
  const { molecules } = useChartData();
  const { moleculeAssignments, activeAssignment, selectMolecule } =
    useMoleculeAssignments(molecules);
  const expansion = useAssignmentExpansion(activeAssignment);

  if (!activeAssignment) {
    return <EmptyText text="No molecules available" />;
  }

  const { molecule } = activeAssignment;

  return (
    <TablePanel>
      <PanelHeader>
        <HeaderControls>
          {moleculeAssignments.length > 1 && (
            <Select
              items={getMoleculeOptions(moleculeAssignments)}
              value={molecule.id}
              onChange={selectMolecule}
              style={{ width: 140 }}
            />
          )}
          <Switch
            label="Expand all"
            checked={expansion.allExpanded}
            disabled={!expansion.canExpand}
            onChange={expansion.toggleAllRows}
            style={{ marginBottom: 0 }}
          />
        </HeaderControls>
      </PanelHeader>
      <div className="inner-container">
        <MoleculeAssignmentTable
          key={molecule.id}
          groups={activeAssignment.groups}
          expandedGroups={expansion.expandedGroups}
          onToggleRow={expansion.toggleRow}
        />
      </div>
    </TablePanel>
  );
}
