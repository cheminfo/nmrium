import type { Range, Signal1D } from '@zakodium/nmr-types';
import { rangesToACS } from 'nmr-processing';

import { getRangesToACSOptions } from '../../../hooks/use_publication_strings.js';

import { assignmentACSOptions } from './assignmentACSOptions.js';
import type { AssignedSignal, FormatAssignmentOptions } from './types.js';

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
