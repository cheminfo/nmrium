import { SignalKindsToInclude } from '../../../constants/SignalsKinds';
import { Range } from '../../../types/data1d';
import { checkSignalKinds } from '../../../utilities/RangeUtilities';

export function checkRangeKind(range: Range): boolean {
  return range.signals && checkSignalKinds(range, SignalKindsToInclude);
}
