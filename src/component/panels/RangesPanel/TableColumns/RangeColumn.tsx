import { formatNumber } from '../../../utility/formatNumber.js';
import { RangeColumnProps } from '../RangesTableRow.js';

interface RangeColumnInnerProps extends Omit<RangeColumnProps, 'row'> {
  value: any;
}

function RangeColumn({
  value,
  rowSpanTags,
  onHover,
  format,
}: RangeColumnInnerProps) {
  return (
    <td {...rowSpanTags} {...onHover}>
      {formatNumber(value, format)}
    </td>
  );
}

export default RangeColumn;
