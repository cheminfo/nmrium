import { Info1D } from '../../../../data/types/data1d';
import { formatNumber } from '../../../utility/formatNumber';
import { checkMultiplicity } from '../../extra/utilities/MultiplicityUtilities';
import { RangeColumnProps } from '../RangesTableRow';

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
