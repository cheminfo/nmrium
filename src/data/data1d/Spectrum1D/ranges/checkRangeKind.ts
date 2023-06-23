import { Range } from 'nmr-processing';

import { SignalKindsToInclude } from '../../../constants/SignalsKinds';
import { checkSignalKinds } from '../../../utilities/RangeUtilities';

export function checkRangeKind(range: Range): boolean {
  return range.signals && checkSignalKinds(range, SignalKindsToInclude);
}
