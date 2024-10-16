import type { Info1D } from 'nmr-processing';
import { checkMultiplicity } from 'nmr-processing';

import { formatNumber } from '../../../utility/formatNumber.js';
import type { RangeColumnProps } from '../RangesTableRow.js';

interface SignalDeltaHzColumnProps extends RangeColumnProps {
  info: Info1D;
}

function SignalDeltaHzColumn({
  row,
  onHover,
  format,
  info,
  rowSpanTags,
}: SignalDeltaHzColumnProps) {
  const signal = row.tableMetaInfo.signal;

  if (!signal) return <td>{''}</td>;
  return (
    <td {...rowSpanTags} {...onHover}>
      {!checkMultiplicity(signal.multiplicity, ['m'])
        ? `${formatNumber(
            row.from * info.originFrequency,
            format,
          )} - ${formatNumber(row.to * info.originFrequency, format)}`
        : info?.originFrequency
          ? formatNumber(signal.delta * info.originFrequency, format)
          : ''}
    </td>
  );
}

export default SignalDeltaHzColumn;
