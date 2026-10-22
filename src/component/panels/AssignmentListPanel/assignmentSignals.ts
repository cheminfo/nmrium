import type { Range, Signal1D } from '@zakodium/nmr-types';
import type {
  ACSExportOptions,
  Spectrum1D,
  Spectrum,
} from '@zakodium/nmrium-core';
import { isSpectrum1D } from '@zakodium/nmrium-core';
import { rangesToACS } from 'nmr-processing';
import type { GroupedDiaID } from 'openchemlib-utils';

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
 * Index signals by nucleus, then OCL ID, so each column can directly look up
 * assignments across all spectra of its nucleus without filtering other nuclei.
 * Entries retain spectrum metadata because ACS formatting needs its frequency.
 */
export type SignalsByNucleus = ReadonlyMap<string, SignalsByOclID>;

export interface AssignedAtomCounts {
  assigned: number;
  total: number;
}

/**
 * Count atoms of the nucleus's element in the selected molecule.
 * The lookup must belong to that nucleus. Counts measure assignment coverage,
 * not the number of signals or whether the assignments have been verified.
 */
export function getAssignedAtomCounts(
  groups: GroupedDiaID[],
  signalsByOclID: SignalsByOclID,
  nucleus: string,
): AssignedAtomCounts {
  let assigned = 0;
  let total = 0;
  const atomLabel = nucleus.replace(/^\d+/, '');

  for (const group of groups) {
    if (group.atomLabel !== atomLabel) continue;

    // Count individual equivalent atoms (for example, 3 H in a methyl group),
    // not one atom per group. The total is independent of observed signals.
    total += group.atoms.length;
    // A group counts once if assigned in any spectrum of this nucleus.
    if (signalsByOclID.has(group.oclID)) {
      assigned += group.atoms.length;
    }
  }

  return { assigned, total };
}

/**
 * Build a nucleus-to-OCL-ID lookup of assigned 1D signals.
 *
 * @returns A map containing an OCL ID lookup for each 1D nucleus, including
 * nuclei without assignments so their columns remain visible.
 * Only the spectrum ID, nucleus, and frequency are retained in a shared metadata
 * object.
 *
 * Notes:
 * 1. Unassigned signals are omitted.
 * 2. Repeated IDs within a signal occur once.
 */
export function getSignalsByNucleus(spectra: Spectrum[]): SignalsByNucleus {
  const signalsByNucleus = new Map<string, Map<string, AssignedSignal[]>>();
  for (const spectrum of spectra) {
    if (!isSpectrum1D(spectrum)) continue;

    // Share one atom-group lookup across all 1D spectra of the same nucleus.
    // Create it even without assignments so the nucleus column stays visible.
    const nucleus = spectrum.info.nucleus;
    let signalsByOclID = signalsByNucleus.get(nucleus);

    if (!signalsByOclID) {
      signalsByOclID = new Map();
      signalsByNucleus.set(nucleus, signalsByOclID);
    }
    // Keep each spectrum's frequency for formatting its own coupling values.
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
        // Index a signal under every linked group, without repeating a link.
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
  return signalsByNucleus;
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
 * @param options - The row (`row.id` is its OCL ID), nucleus-specific signal
 * lookup, precomputed parent-to-hydrogen lookup, and optional spectrum ID.
 * @returns One group per matching spectrum, with duplicate entries removed when
 * the same signal matches several OCL IDs.
 */
export function getAssignmentSignals(
  options: GetAssignmentSignalsOptions,
): AssignmentSignals[] {
  const { row, signalsByOclID, hydrogenIDsByParent, spectrumId } = options;
  // Include attached H assignments on the parent row even when H rows are hidden.
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
      // A signal linked to several of this row's groups should appear only once.
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

const assignmentACSOptions: Partial<ACSExportOptions> = {
  signalKind: 'signal',
  ascending: true,
  format: 'IMJ',
  textStyle: {},
};

interface FormatAssignmentOptions {
  assignment: AssignmentSignals;
  acs: ACSExportOptions;
}

/**
 * Format one spectrum's assignments as ACS HTML without the spectrum header
 * or final period.
 */
export function formatAssignmentACS(options: FormatAssignmentOptions): string {
  const { assignment } = options;
  const acs = { ...options.acs, ...assignmentACSOptions };
  const { spectrum, entries } = assignment;

  const acsString = rangesToACS(getAssignedRanges(entries), {
    ...getRangesToACSOptions(spectrum.info, acs),
    filter: false,
  });

  // "1H NMR (600 MHz): δ 4.04 (d)." becomes "δ 4.04 (d)".
  return acsString.replaceAll(/^[^:]*:\s*|\.$/g, '');
}

/**
 * Sort and format signal deltas without adding spectrum details or units.
 * @returns Shift values joined with ', '
 */
export function formatAssignmentShifts(
  options: FormatAssignmentOptions,
): string {
  const { entries } = options.assignment;
  const acs = { ...options.acs, ...assignmentACSOptions };

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
