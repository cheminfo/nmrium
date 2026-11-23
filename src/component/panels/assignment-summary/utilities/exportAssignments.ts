import type { ACSExportOptions, Spectrum } from '@zakodium/nmrium-core';
import type { GroupedDiaID, TopicMolecule } from 'openchemlib-utils';
import papa from 'papaparse';

import { formatAssignmentLabel } from '../table-cells/AssignmentLabelCell.js';

import {
  atomGroupsToAssignmentRows,
  getHydrogenIDsByParent,
  getVisibleAssignmentRows,
} from './atomGroupsToAssignmentRows.js';
import { formatAssignmentACS } from './formatAssignmentACS.js';
import { formatAssignmentShifts } from './formatAssignmentShifts.js';
import { getAssignmentSignals } from './getAssignmentSignals.js';
import {
  formatLinkedCorrelations,
  getLinkedCorrelationsByExperiment,
} from './getLinkedCorrelationsByExperiment.js';
import { getSignalsByNucleus } from './getSignalsByNucleus.js';
import type { GetAssignmentSignalsOptions } from './types.js';

export type AssignmentExportRowMode = 'current' | 'expanded' | 'collapsed';

interface AssignmentExportOptions {
  groups: GroupedDiaID[];
  topicMolecule: TopicMolecule;
  spectra: Spectrum[];
  expandedGroups: Set<string>;
  rowMode: AssignmentExportRowMode;
  acsExportSettings: Record<string, ACSExportOptions>;
  defaultACSOptions: ACSExportOptions;
  delimiter: ',' | '\t';
}

/**
 * Export the selected molecule as CSV or TSV using the table's formatting rules.
 */
export function exportAssignments(options: AssignmentExportOptions): string {
  const { fields, data } = getAssignmentExportData(options);
  return papa.unparse(
    { fields, data },
    { delimiter: options.delimiter, escapeFormulae: true },
  );
}

function getAssignmentExportData(options: AssignmentExportOptions) {
  const {
    groups,
    topicMolecule,
    spectra,
    expandedGroups,
    rowMode,
    acsExportSettings,
    defaultACSOptions,
  } = options;
  const allRows = atomGroupsToAssignmentRows(groups, true);
  const rows =
    rowMode === 'expanded'
      ? allRows
      : getVisibleAssignmentRows(
          allRows,
          rowMode === 'current' ? expandedGroups : new Set<string>(),
        );
  const hydrogenIDsByParent = getHydrogenIDsByParent(allRows);
  const linkedAssignmentsByExperiment = Array.from(
    getLinkedCorrelationsByExperiment(spectra, topicMolecule),
  );
  const nuclei = Array.from(
    getSignalsByNucleus(spectra),
    ([nucleus, signals]) => ({
      nucleus,
      signalsByOclID: signals,
      acs: acsExportSettings[nucleus] ?? defaultACSOptions,
    }),
  );

  const fields = [
    'Atom',
    'Atom numbers',
    'Atom labels',
    ...nuclei.map(({ nucleus }) => nucleus),
    ...linkedAssignmentsByExperiment.map(([experiment]) => experiment),
  ];
  const data = rows.map((row) => [
    row.atomLabel,
    formatAssignmentLabel({
      value: row.atomNumbers,
      hydrogenValue: row.hydrogenAtomNumbers,
      isExpanded: row.isExpanded,
    }),
    formatAssignmentLabel({
      value: row.atomLabels,
      hydrogenValue: row.hydrogenAtomLabels,
      isExpanded: row.isExpanded,
    }),
    ...nuclei.map(({ signalsByOclID, acs }) =>
      formatAssignmentCell({
        row,
        signalsByOclID,
        hydrogenIDsByParent,
        groups,
        acs,
      }),
    ),
    ...linkedAssignmentsByExperiment.map(([, assignmentsByOclID]) =>
      formatLinkedCorrelations(row, assignmentsByOclID, hydrogenIDsByParent)
        .map(({ text }) => text)
        .join(', '),
    ),
  ]);

  return { fields, data };
}

interface FormatAssignmentCellOptions extends GetAssignmentSignalsOptions {
  acs: ACSExportOptions;
}

function formatAssignmentCell(options: FormatAssignmentCellOptions): string {
  const { row, acs } = options;

  return getAssignmentSignals(options)
    .map((assignment) => {
      if (row.isHydrogen) {
        return `${formatAssignmentShifts({ assignment, deltaFormat: acs.deltaFormat })} ppm`;
      }
      // The ACS formatter emits <i>J</i> for couplings
      // Strip HTML tags so spreadsheet cells contain plain text.
      return formatAssignmentACS({ assignment, acs }).replaceAll(
        /<[^>]+>/g,
        '',
      );
    })
    .join(', ');
}
