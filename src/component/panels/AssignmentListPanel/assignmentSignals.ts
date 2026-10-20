import type { Range, Signal1D } from '@zakodium/nmr-types';
import type {
  ACSExportOptions,
  Spectrum1D,
  Spectrum,
} from '@zakodium/nmrium-core';
import { isSpectrum1D } from '@zakodium/nmrium-core';
import { rangesToACS } from 'nmr-processing';

import { getRangesToACSOptions } from '../../hooks/use_publication_strings.js';
import { formatNumber } from '../../utility/formatNumber.js';

import type { AssignmentListRow } from './atomGroupsToAssignmentRows.js';

interface AssignmentSpectrum {
  id: string;
  info: Pick<Spectrum1D['info'], 'nucleus' | 'originFrequency'>;
}

interface AssignedSignal {
  spectrum: AssignmentSpectrum;
  range: Range;
  signal: Signal1D;
}

export type SignalsByOclID = ReadonlyMap<string, readonly AssignedSignal[]>;

/**
 * Build a lookup of assigned 1D signals using the OCL IDs in `signal.diaIDs`.
 *
 * @returns A map from each OCL ID to its signals and original range references.
 * Only the spectrum ID, nucleus, and frequency are retained in a shared metadata
 * object.
 *
 * Notes:
 * 1. Unassigned signals are omitted.
 * 2. Repeated IDs within a signal occur once.
 */
export function getSignalsByOclID(spectra: Spectrum[]): SignalsByOclID {
  const signalsByOclID = new Map<string, AssignedSignal[]>();
  for (const spectrum of spectra) {
    if (!isSpectrum1D(spectrum)) continue;
    const assignmentSpectrum: AssignmentSpectrum = {
      id: spectrum.id,
      info: {
        nucleus: spectrum.info.nucleus,
        originFrequency: spectrum.info.originFrequency,
      },
    };
    for (const range of spectrum.ranges.values) {
      for (const signal of range.signals) {
        const entry = { spectrum: assignmentSpectrum, range, signal };
        for (const oclID of new Set(signal.diaIDs)) {
          const entries = signalsByOclID.get(oclID);
          if (entries) {
            entries.push(entry);
          } else {
            signalsByOclID.set(oclID, [entry]);
          }
        }
      }
    }
  }
  return signalsByOclID;
}

export interface AssignmentSignals {
  spectrum: AssignmentSpectrum;
  entries: AssignedSignal[];
}

export interface GetAssignmentSignalsOptions {
  row: AssignmentListRow;
  signalsByOclID: SignalsByOclID;
  hydrogenIDsByParent: ReadonlyMap<string, readonly string[]>;
  spectrumId?: string;
}

/**
 * Collect a row's signals and those of its attached hydrogen groups.
 *
 * @param options - The row (`row.id` is its OCL ID), signal lookup, precomputed
 * parent-to-hydrogen lookup, and optional spectrum ID to restrict the results.
 * @returns One group per matching spectrum, with duplicate entries removed when
 * the same signal matches several OCL IDs.
 */
export function getAssignmentSignals(
  options: GetAssignmentSignalsOptions,
): AssignmentSignals[] {
  const { row, signalsByOclID, hydrogenIDsByParent, spectrumId } = options;
  const oclIDs = [row.id, ...(hydrogenIDsByParent.get(row.id) ?? [])];
  const signalsBySpectrum = new Map<
    string,
    { spectrum: AssignmentSpectrum; signals: Set<AssignedSignal> }
  >();

  for (const oclID of oclIDs) {
    for (const entry of signalsByOclID.get(oclID) ?? []) {
      if (spectrumId !== undefined && entry.spectrum.id !== spectrumId) {
        continue;
      }
      let group = signalsBySpectrum.get(entry.spectrum.id);

      if (!group) {
        group = { spectrum: entry.spectrum, signals: new Set() };
        signalsBySpectrum.set(entry.spectrum.id, group);
      }
      group.signals.add(entry);
    }
  }

  return Array.from(signalsBySpectrum.values(), (group) => {
    const entries = Array.from(group.signals);
    return {
      spectrum: group.spectrum,
      entries,
    };
  });
}

interface FormatAssignmentSignalsOptions {
  assignment: AssignmentSignals;
  acs: ACSExportOptions;
  format: 'shifts' | 'acs';
}

/**
 * Format one spectrum's collected assignments for a chemical-shift cell.
 *
 * @returns A comma-separated shift string without units, or the HTML returned by
 * `rangesToACS`
 *
 */
export function formatAssignmentSignals(
  options: FormatAssignmentSignalsOptions,
): string {
  const { assignment, acs, format } = options;
  const { spectrum, entries } = assignment;
  if (format === 'shifts') {
    return formatChemicalShifts({ entries, acs });
  }

  return rangesToACS(getAssignedRanges(entries), {
    ...getRangesToACSOptions(spectrum.info, acs),
    filter: false,
  });
}

interface formatChemicalShiftsOptions extends Pick<
  AssignmentSignals,
  'entries'
> {
  acs: ACSExportOptions;
}

/**
 * Sort and format signal deltas without adding spectrum details or units.
 * @returns Shift values joined with ', '
 */
function formatChemicalShifts(options: formatChemicalShiftsOptions) {
  const { entries, acs } = options;

  return entries
    .map(({ signal }) => signal.delta)
    .toSorted((a, b) => (acs.ascending ? a - b : b - a))
    .map((delta) => formatNumber(delta, acs.deltaFormat))
    .join(', ');
}

/**
 * Rebuild the selected ranges with only the collected signals.
 */
function getAssignedRanges(entries: AssignedSignal[]): Range[] {
  const signalsByRange = new Map<Range, Signal1D[]>();
  for (const { range, signal } of entries) {
    const signals = signalsByRange.get(range);
    if (signals) {
      signals.push(signal);
    } else {
      signalsByRange.set(range, [signal]);
    }
  }
  return Array.from(signalsByRange, ([range, signals]) => ({
    ...range,
    signals,
  }));
}
