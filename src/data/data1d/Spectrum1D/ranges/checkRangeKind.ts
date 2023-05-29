import { Range, SignalKindsToInclude } from 'nmr-processing';

import { checkSignalKinds } from '../../../utilities/RangeUtilities';

export function checkRangeKind(range: Range): boolean {
  return range.signals && checkSignalKinds(range, SignalKindsToInclude);
}
