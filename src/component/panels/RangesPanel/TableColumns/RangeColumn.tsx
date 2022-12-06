import { formatNumber } from '../../../utility/formatNumber';
import { RangeColumnProps } from '../RangesTableRow';

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
