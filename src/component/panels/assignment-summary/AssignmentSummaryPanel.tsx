import styled from '@emotion/styled';
import { Molecule } from 'openchemlib';
import type { GroupedDiaID } from 'openchemlib-utils';
import { TopicMolecule } from 'openchemlib-utils';
import { useMemo, useState } from 'react';
import { FaHashtag } from 'react-icons/fa';
import { PanelHeader, Toolbar } from 'react-science/ui';

import type { StateMoleculeExtended } from '../../../data/molecules/Molecule.js';
import { useChartData } from '../../context/ChartContext.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { EmptyText } from '../../elements/EmptyText.js';
import Select from '../../elements/Select.js';
import type { ToolbarPopoverMenuItem } from '../../elements/ToolbarPopoverItem.js';
import { ToolbarPopoverItem } from '../../elements/ToolbarPopoverItem.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import { booleanToString } from '../../utility/booleanToString.js';
import { TablePanel } from '../extra/BasicPanelStyle.js';

import { AssignmentsExportModal } from './AssignmentsExportModal.js';
import { MoleculeAssignmentTable } from './MoleculeAssignmentTable.js';
import { atomGroupsToAssignmentRows } from './utilities/atomGroupsToAssignmentRows.js';

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

function useAssignmentExpansion(activeAssignment: MoleculeAssignmentData) {
  const [expandedGroupsByMolecule, setExpandedGroupsByMolecule] = useState<
    ReadonlyMap<string, ReadonlySet<string>>
  >(() => new Map());
  const moleculeId = activeAssignment.molecule.id;
  const { expandableGroupIds } = activeAssignment;
  const expandedGroups =
    expandedGroupsByMolecule.get(moleculeId) ?? new Set<string>();

  function toggleRows(groupIds: readonly string[]) {
    setExpandedGroupsByMolecule((previous) => {
      const next = new Map(previous);
      next.set(
        moleculeId,
        toggleExpandedRows(previous.get(moleculeId) ?? new Set(), groupIds),
      );
      return next;
    });
  }

  function setAllRows(expanded: boolean) {
    setExpandedGroupsByMolecule((previous) => {
      const next = new Map(previous);
      next.set(moleculeId, new Set(expanded ? expandableGroupIds : []));
      return next;
    });
  }

  function toggleRow(groupId: string) {
    toggleRows([groupId]);
  }

  return {
    expandedGroups,
    canExpand: expandableGroupIds.some((id) => !expandedGroups.has(id)),
    canCollapse: expandableGroupIds.some((id) => expandedGroups.has(id)),
    toggleRow,
    setAllRows,
  };
}

type ExpansionAction = 'expand' | 'collapse';

const EXPANSION_MENU: Array<ToolbarPopoverMenuItem<ExpansionAction>> = [
  { text: 'Expand all', icon: 'expand-all', data: 'expand' },
  { text: 'Collapse all', icon: 'collapse-all', data: 'collapse' },
];

interface ExpansionMenuProps {
  canExpand: boolean;
  canCollapse: boolean;
  onSelect: (expanded: boolean) => void;
}

function ExpansionMenu(props: ExpansionMenuProps) {
  const { canExpand, canCollapse, onSelect } = props;
  const options = EXPANSION_MENU.map((option) => ({
    ...option,
    disabled: option.data === 'expand' ? !canExpand : !canCollapse,
  }));

  return (
    <ToolbarPopoverItem<ExpansionAction>
      icon="expand-all"
      tooltip="Expand / collapse rows"
      tooltipProps={{ minimal: true }}
      options={options}
      onClick={(action) => onSelect(action === 'expand')}
    />
  );
}

export function AssignmentSummaryPanel() {
  const { molecules } = useChartData();
  const { dispatch } = usePreferences();
  const { showAtomNumbers } = usePanelPreferences('assignmentSummary');
  const { moleculeAssignments, activeAssignment, selectMolecule } =
    useMoleculeAssignments(molecules);

  function toggleAtomNumbers() {
    dispatch({
      type: 'SET_PANELS_PREFERENCES',
      payload: {
        key: 'assignmentSummary',
        value: { showAtomNumbers: !showAtomNumbers },
      },
    });
  }

  if (!activeAssignment) {
    return <EmptyText text="No molecules available" />;
  }

  return (
    <AssignmentSummary
      moleculeAssignments={moleculeAssignments}
      activeAssignment={activeAssignment}
      onSelectMolecule={selectMolecule}
      showAtomNumbers={showAtomNumbers}
      onToggleAtomNumbers={toggleAtomNumbers}
    />
  );
}

interface AssignmentSummaryProps {
  moleculeAssignments: MoleculeAssignmentData[];
  activeAssignment: MoleculeAssignmentData;
  onSelectMolecule: (moleculeId: string) => void;
  showAtomNumbers: boolean;
  onToggleAtomNumbers: () => void;
}

function AssignmentSummary(props: AssignmentSummaryProps) {
  const {
    moleculeAssignments,
    activeAssignment,
    onSelectMolecule,
    showAtomNumbers,
    onToggleAtomNumbers,
  } = props;
  const expansion = useAssignmentExpansion(activeAssignment);
  const { molecule } = activeAssignment;

  return (
    <TablePanel>
      <PanelHeader>
        <Toolbar>
          <Toolbar.Item
            icon={<FaHashtag />}
            tooltip={`${booleanToString(!showAtomNumbers)} atom numbers column`}
            active={showAtomNumbers}
            onClick={onToggleAtomNumbers}
          />
          <AssignmentsExportModal
            groups={activeAssignment.groups}
            expandedGroups={expansion.expandedGroups}
            moleculeLabel={molecule.label}
          />
          <ExpansionMenu
            canExpand={expansion.canExpand}
            canCollapse={expansion.canCollapse}
            onSelect={expansion.setAllRows}
          />
        </Toolbar>
        <HeaderControls>
          {moleculeAssignments.length > 1 && (
            <Select
              items={getMoleculeOptions(moleculeAssignments)}
              value={molecule.id}
              onChange={onSelectMolecule}
              style={{ width: 140 }}
            />
          )}
        </HeaderControls>
      </PanelHeader>
      <div className="inner-container">
        <MoleculeAssignmentTable
          key={molecule.id}
          groups={activeAssignment.groups}
          expandedGroups={expansion.expandedGroups}
          onToggleRow={expansion.toggleRow}
          showAtomNumbers={showAtomNumbers}
        />
      </div>
    </TablePanel>
  );
}
