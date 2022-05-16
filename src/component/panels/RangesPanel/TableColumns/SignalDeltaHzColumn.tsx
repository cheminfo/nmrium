import { Info1D } from '../../../../data/types/data1d';
import FormatNumber from '../../../utility/FormatNumber';
import { checkMultiplicity } from '../../extra/utilities/MultiplicityUtilities';

interface SignalDeltaHzColumnProps {
  rowData: any;
  onHoverSignal: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  fromFormat: string;
  toFormat: string;
  deltaHzFormat: string;
  info: Info1D;
}

function SignalDeltaHzColumn({
  rowData,
  onHoverSignal,
  fromFormat,
  toFormat,
  deltaHzFormat,
  info,
}: SignalDeltaHzColumnProps) {
  const signal = rowData.tableMetaInfo.signal;

  if (!signal) return <td>{''}</td>;
  return (
    <td {...onHoverSignal}>
      {!checkMultiplicity(signal.multiplicity, ['m'])
        ? `${FormatNumber(
            rowData.from * info.originFrequency,
            fromFormat,
          )} - ${FormatNumber(rowData.to * info.originFrequency, toFormat)}`
        : info?.originFrequency
        ? FormatNumber(signal.delta * info.originFrequency, deltaHzFormat)
        : ''}
    </td>
  );
}

export default SignalDeltaHzColumn;
