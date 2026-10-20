import { Switch, Tab, Tabs } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { Molecule } from 'openchemlib';
import type { GroupedDiaID } from 'openchemlib-utils';
import { TopicMolecule } from 'openchemlib-utils';
import { useId, useMemo, useState } from 'react';

import type { StateMoleculeExtended } from '../../../data/molecules/Molecule.js';
import { useChartData } from '../../context/ChartContext.js';
import { EmptyText } from '../../elements/EmptyText.js';

import { MoleculeAssignmentTable } from './MoleculeAssignmentTable.js';
import { atomGroupsToAssignmentRows } from './atomGroupsToAssignmentRows.js';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  gap: 8px;
  padding: 8px;
  overflow: hidden;

  > :not(:last-child) {
    flex-shrink: 0;
  }

  [role='tablist'] {
    overflow-x: auto;
    flex-shrink: 0;
  }
`;

const TableContainer = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

interface MoleculeAssignmentData {
  molecule: StateMoleculeExtended;
  groups: GroupedDiaID[];
  expandableGroupIds: string[];
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
  const tabsId = useId();
  const { moleculeAssignments, activeAssignment, selectMolecule } =
    useMoleculeAssignments(molecules);
  const expansion = useAssignmentExpansion(activeAssignment);

  if (!activeAssignment) {
    return <EmptyText text="No molecules available" />;
  }

  const { molecule } = activeAssignment;

  return (
    <Container>
      <Tabs
        id={tabsId}
        selectedTabId={molecule.id}
        onChange={(id: string) => selectMolecule(id)}
      >
        {moleculeAssignments.map(({ molecule: tabMolecule }) => (
          <Tab
            key={tabMolecule.id}
            id={tabMolecule.id}
            title={tabMolecule.label}
          />
        ))}
      </Tabs>
      <Switch
        label="Expand all"
        checked={expansion.allExpanded}
        disabled={!expansion.canExpand}
        onChange={expansion.toggleAllRows}
        style={{ marginBottom: 0 }}
      />
      <TableContainer>
        <MoleculeAssignmentTable
          key={molecule.id}
          groups={activeAssignment.groups}
          expandedGroups={expansion.expandedGroups}
          onToggleRow={expansion.toggleRow}
        />
      </TableContainer>
    </Container>
  );
}
