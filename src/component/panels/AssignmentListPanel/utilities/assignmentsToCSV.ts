import type { ACSExportOptions, Spectrum } from '@zakodium/nmrium-core';
import type { GroupedDiaID } from 'openchemlib-utils';
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
import { getSignalsByNucleus } from './getSignalsByNucleus.js';
import type { GetAssignmentSignalsOptions } from './types.js';

export type AssignmentExportRowMode = 'current' | 'expanded' | 'collapsed';

interface ExportAssignmentsToCSVOptions {
  groups: readonly GroupedDiaID[];
  spectra: Spectrum[];
  expandedGroups: ReadonlySet<string>;
  rowMode: AssignmentExportRowMode;
  acsExportSettings: Record<string, ACSExportOptions>;
  defaultACSOptions: ACSExportOptions;
}

/**
 * Export the selected molecule using the table's row and formatting rules.
 */
export function exportAssignmentsToCSV(
  options: ExportAssignmentsToCSVOptions,
): string {
  const {
    groups,
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
    ...nuclei.map(({ nucleus }) => `${nucleus} \u{03B4}`),
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
      formatAssignmentCSVCell({
        row,
        signalsByOclID,
        hydrogenIDsByParent,
        acs,
      }),
    ),
  ]);

  return papa.unparse({ fields, data }, { escapeFormulae: true });
}

interface FormatAssignmentCSVCellOptions extends GetAssignmentSignalsOptions {
  acs: ACSExportOptions;
}

function formatAssignmentCSVCell(
  options: FormatAssignmentCSVCellOptions,
): string {
  const { row, acs } = options;

  return getAssignmentSignals(options)
    .map((assignment) => {
      if (row.isHydrogen) {
        return `${formatAssignmentShifts({ assignment, acs })} ppm`;
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
