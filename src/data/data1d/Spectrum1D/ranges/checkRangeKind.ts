import { Range } from 'nmr-processing';

import { SIGNAL_INCLUDED_KINDS } from '../../../constants/signalsKinds.js';
import { checkSignalKinds } from '../../../utilities/RangeUtilities.js';

export function checkRangeKind(range: Range): boolean {
  return range.signals && checkSignalKinds(range, SIGNAL_INCLUDED_KINDS);
}
