import { checkMultiplicity } from 'nmr-processing';

import { useDispatch } from '../../../context/DispatchContext';
import EditableColumn from '../../../elements/EditableColumn';
import { formatNumber } from '../../../utility/formatNumber';
import { RangeColumnProps } from '../RangesTableRow';

function SignalDeltaColumn({
  row,
  onHover,
  format,
  rowSpanTags,
}: RangeColumnProps) {
  const dispatch = useDispatch();
  const signal = row?.tableMetaInfo?.signal;

  function saveHandler(event) {
    dispatch({
      type: 'CHANGE_RANGE_SIGNAL_VALUE',
      payload: {
        value: event.target.value,
        rangeID: row.id,
        signalID: signal.id,
      },
    });
  }

  const rangeText = `${formatNumber(row.from, format)} - ${formatNumber(
    row.to,
    format,
  )}`;

  if (!signal || !checkMultiplicity(signal.multiplicity, ['m'])) {
    return (
      <td {...rowSpanTags} {...onHover}>
        {rangeText}
      </td>
    );
  }

  return (
    <td {...rowSpanTags} {...onHover}>
      <EditableColumn
        value={formatNumber(signal.delta, format)}
        onSave={saveHandler}
        type="number"
        style={{ padding: '0.1rem 0.4rem' }}
        validate={(val) => val !== ''}
      />
    </td>
  );
}

export default SignalDeltaColumn;
