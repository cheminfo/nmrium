import { useDispatch } from '../../../context/DispatchContext';
import EditableColumn from '../../../elements/EditableColumn';
import { CHANGE_RANGE_SIGNAL_VALUE } from '../../../reducer/types/Types';
import { formatNumber } from '../../../utility/formatNumber';
import { checkMultiplicity } from '../../extra/utilities/MultiplicityUtilities';
import { RangeColumnProps } from '../RangesTableRow';

function SignalDeltaColumn({
  row,
  onHover,
  format,
  rowSpanTags,
}: RangeColumnProps) {
  const dispatch = useDispatch();
  const signal = row.tableMetaInfo.signal;

  function saveHandler(event) {
    dispatch({
      type: CHANGE_RANGE_SIGNAL_VALUE,
      payload: {
        value: event.target.value,
        rangeID: row.id,
        signalID: signal.id,
      },
    });
  }

  if (!signal) return <td>{''}</td>;

  return (
    <td {...rowSpanTags} {...onHover}>
      {!checkMultiplicity(signal.multiplicity, ['m']) ? (
        `${formatNumber(row.from, format)} - ${formatNumber(row.to, format)}`
      ) : (
        <EditableColumn
          value={formatNumber(signal.delta, format)}
          onSave={saveHandler}
          type="number"
          style={{ padding: '0.1rem 0.4rem' }}
        />
      )}
    </td>
  );
}

export default SignalDeltaColumn;
