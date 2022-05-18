import { Info1D } from '../../../../data/types/data1d';
import { formatNumber } from '../../../utility/formatNumber';
import { checkMultiplicity } from '../../extra/utilities/MultiplicityUtilities';

interface SignalDeltaHzColumnProps {
  rowData: any;
  onHoverSignal: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  deltaHzFormat: string;
  info: Info1D;
}

function SignalDeltaHzColumn({
  rowData,
  onHoverSignal,
  deltaHzFormat,
  info,
}: SignalDeltaHzColumnProps) {
  const signal = rowData.tableMetaInfo.signal;

  if (!signal) return <td>{''}</td>;
  return (
    <td {...onHoverSignal}>
      {!checkMultiplicity(signal.multiplicity, ['m'])
        ? `${formatNumber(
            rowData.from * info.originFrequency,
            deltaHzFormat,
          )} - ${formatNumber(
            rowData.to * info.originFrequency,
            deltaHzFormat,
          )}`
        : info?.originFrequency
        ? formatNumber(signal.delta * info.originFrequency, deltaHzFormat)
        : ''}
    </td>
  );
}

export default SignalDeltaHzColumn;
