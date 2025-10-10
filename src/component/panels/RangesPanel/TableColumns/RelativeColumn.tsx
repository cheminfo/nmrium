import { checkRangeKind } from '../../../../data/utilities/RangeUtilities.js';
import { useDispatch } from '../../../context/DispatchContext.js';
import { EditableColumn } from '../../../elements/EditableColumn.js';
import { formatNumber } from '../../../utility/formatNumber.js';
import type { RangeColumnProps } from '../RangesTableRow.js';

function RelativeColumn({
  row,
  rowSpanTags,
  onHover,
  format,
}: RangeColumnProps) {
  const dispatch = useDispatch();

  const flag = checkRangeKind(row);
  const formattedValue = formatNumber(row.integration, format);
  const integralVal = flag ? formattedValue : `[ ${formattedValue} ]`;

  function saveHandler(event: any) {
    dispatch({
      type: 'CHANGE_RANGE_RELATIVE',
      payload: {
        value: event.target.value,
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

export default RelativeColumn;
