import type { ACSExportOptions } from '@zakodium/nmrium-core';
import { rangesToACS } from 'nmr-processing';

import { getRangesToACSOptions } from '../../../hooks/use_publication_strings.js';

import type { FormatAssignmentOptions } from './types.js';

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
  const { spectrum, ranges } = assignment;
  const acs = {
    ...options.acs,
    ...assignmentACSOptions,
    ...(spectrum.info.nucleus === '13C' && { format: 'D' }),
  };

  const acsString = rangesToACS(ranges, {
    ...getRangesToACSOptions(spectrum.info, acs),
    filter: false,
  });

  // "1H NMR (600 MHz): δ 4.04 (d)." becomes "4.04 (d)".
  return acsString.replaceAll(/^(?:[^:]*:\s*)?\u{03B4}\s*|\.$/gu, '');
}
