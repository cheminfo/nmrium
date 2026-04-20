import { checkMultiplicity } from 'nmr-processing';
import { assert } from 'react-science/ui';

import { useDispatch } from '../../../context/DispatchContext.js';
import type { EditableColumnProps } from '../../../elements/EditableColumn.js';
import { EditableColumn } from '../../../elements/EditableColumn.js';
import { formatNumber } from '../../../utility/formatNumber.js';
import type { RangeColumnProps } from '../RangesTableRow.js';

export default function SignalDeltaColumn(props: RangeColumnProps) {
  const { row, onHover, format, rowSpanTags } = props;
  const dispatch = useDispatch();
  const signal = row?.tableMetaInfo?.signal;

  const saveHandler: EditableColumnProps['onSave'] = (value) => {
    assert(signal);
    dispatch({
      type: 'CHANGE_RANGE_SIGNAL_VALUE',
      payload: {
        value: Number(value),
        rangeId: row.id,
        signalId: signal.id,
      },
    });
  };

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
