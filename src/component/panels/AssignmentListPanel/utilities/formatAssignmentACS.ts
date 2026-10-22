import type { Range, Signal1D } from '@zakodium/nmr-types';
import type { ACSExportOptions } from '@zakodium/nmrium-core';
import { rangesToACS } from 'nmr-processing';

import { getRangesToACSOptions } from '../../../hooks/use_publication_strings.js';

import type { AssignedSignal, FormatAssignmentOptions } from './types.js';

const assignmentACSOptions: Partial<ACSExportOptions> = {
  signalKind: 'signal',
  ascending: true,
  format: 'IMJ',
  textStyle: {},
};

/**
 * Format one spectrum's assignments as ACS HTML without the spectrum header,
 * delta prefix, or final period.
 */
export function formatAssignmentACS(options: FormatAssignmentOptions): string {
  const { assignment } = options;
  const { spectrum, entries } = assignment;
  const acs = {
    ...options.acs,
    ...assignmentACSOptions,
    ...(spectrum.info.nucleus === '13C' && { format: 'D' }),
  };

  const acsString = rangesToACS(getAssignedRanges(entries), {
    ...getRangesToACSOptions(spectrum.info, acs),
    filter: false,
  });

  // "1H NMR (600 MHz): δ 4.04 (d)." becomes "4.04 (d)".
  return acsString.replaceAll(/^(?:[^:]*:\s*)?\u{03B4}\s*|\.$/gu, '');
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
