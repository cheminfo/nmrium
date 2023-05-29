import type { Integral } from 'nmr-processing';

import { SignalKindsToInclude } from '../../../constants/SignalsKinds';

/**
 * check whether integral based on its kind can be included in another operation or not
 * @param integral  integral
 * @returns {boolean}
 */
export function checkIntegralKind(integral: Integral): boolean {
  return SignalKindsToInclude.includes(integral.kind);
}
