import { SignalKindsToInclude } from '../../../constants/SignalsKinds';
import { Integral } from '../../../types/data1d';

/**
 * check whether integral based on its kind can be included in another operation or not
 * @param integral  integral
 * @returns {boolean}
 */
export function checkIntegralKind(integral: Integral): boolean {
  return SignalKindsToInclude.includes(integral.kind);
}
