import { formatNumber } from '../../../utility/formatNumber.js';
import { RangeColumnProps } from '../RangesTableRow.js';

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
