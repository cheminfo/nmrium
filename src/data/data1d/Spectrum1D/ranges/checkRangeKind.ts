import { Range } from 'nmr-processing';

import { SIGNAL_INCLUDED_KINDS } from '../../../constants/signalsKinds';
import { checkSignalKinds } from '../../../utilities/RangeUtilities';

export function checkRangeKind(range: Range): boolean {
  return range.signals && checkSignalKinds(range, SIGNAL_INCLUDED_KINDS);
}
