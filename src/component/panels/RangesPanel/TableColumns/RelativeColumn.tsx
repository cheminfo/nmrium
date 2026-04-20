import { isSignalRange } from '../../../../data/utilities/RangeUtilities.js';
import { useDispatch } from '../../../context/DispatchContext.js';
import { EditableColumn } from '../../../elements/EditableColumn.js';
import { formatNumber } from '../../../utility/formatNumber.js';
import type { RangeColumnProps } from '../RangesTableRow.js';

export default function RelativeColumn(props: RangeColumnProps) {
  const { row, rowSpanTags, onHover, format } = props;
  const dispatch = useDispatch();

  const flag = isSignalRange(row);
  const formattedValue = formatNumber(row.integration, format);
  const integralVal = flag ? formattedValue : `[ ${formattedValue} ]`;

  function saveHandler(value: string | number) {
    dispatch({
      type: 'CHANGE_RANGE_RELATIVE',
      payload: {
        value: Number(value),
        id: row.id,
      },
    });
  }

  return (
    <td {...rowSpanTags} {...onHover}>
      <EditableColumn
        value={integralVal}
        onSave={saveHandler}
        validate={(val) => val !== ''}
        type="number"
        style={{ padding: '0.1rem 0.4rem' }}
      />
    </td>
  );
}
