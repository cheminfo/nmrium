import type { Range, Signal1D } from '@zakodium/nmr-types';
import type { ACSExportOptions, Spectrum1D } from '@zakodium/nmrium-core';
import type { GroupedDiaID } from 'openchemlib-utils';

import type { AssignmentListRow } from './atomGroupsToAssignmentRows.js';

export interface AssignmentSpectrum {
  id: string;
  info: Pick<Spectrum1D['info'], 'nucleus' | 'originFrequency'>;
}

export interface AssignedSignal {
  spectrum: AssignmentSpectrum;
  range: Range;
  signal: Signal1D;
}

export type SignalsByOclID = Map<string, AssignedSignal[]>;

/**
 * Index signals by nucleus, then OCL ID, so each column can directly look up
 * assignments across all spectra of its nucleus without filtering other nuclei.
 * Entries retain spectrum metadata because ACS formatting needs its frequency.
 */
export type SignalsByNucleus = Map<string, SignalsByOclID>;

export interface AssignedAtomCounts {
  assigned: number;
  total: number;
}

export interface AssignmentSignals {
  spectrum: AssignmentSpectrum;
  ranges: Range[];
}

export interface GetAssignmentSignalsOptions {
  row: AssignmentListRow;
  groups: GroupedDiaID[];
  signalsByOclID: SignalsByOclID;
  hydrogenIDsByParent: Map<string, string[]>;
}

export interface FormatAssignmentOptions {
  assignment: AssignmentSignals;
  acs: ACSExportOptions;
}
