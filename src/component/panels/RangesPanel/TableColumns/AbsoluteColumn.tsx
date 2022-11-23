import { formatNumber } from '../../../utility/formatNumber';
import { RangeColumnProps } from '../RangesTableRow';

function AbsoluteColumn({
  rowSpanTags,
  row,
  onHover,
  format,
}: RangeColumnProps) {
  return (
    <td {...rowSpanTags} {...onHover}>
      {formatNumber(row.absolute, format)}
    </td>
  );
}

export default AbsoluteColumn;
