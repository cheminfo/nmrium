import { checkRangeKind } from '../../../../data/utilities/RangeUtilities';
import { useDispatch } from '../../../context/DispatchContext';
import EditableColumn from '../../../elements/EditableColumn';
import { CHANGE_RANGE_RELATIVE } from '../../../reducer/types/Types';
import { formatNumber } from '../../../utility/formatNumber';
import { RangeColumnProps } from '../RangesTableRow';

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

  function saveHandler(event) {
    dispatch({
      type: CHANGE_RANGE_RELATIVE,
      payload: {
        data: { value: event.target.value, id: row.id },
      },
    });
  }

  return (
    <td {...rowSpanTags} {...onHover}>
      <EditableColumn
        value={integralVal}
        onSave={saveHandler}
        type="number"
        style={{ padding: '0.1rem 0.4rem' }}
      />
    </td>
  );
}

export default RelativeColumn;
