import { CSSProperties, memo } from 'react';

import { formatNumber } from '../../../utility/formatNumber';

interface RangeColumnProps {
  value: any;
  rowSpanTags: {
    rowSpan: any;
    style: CSSProperties;
  };
  onHoverRange?: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  format: string;
}

function RangeColumn({
  value,
  rowSpanTags,
  onHoverRange,
  format,
}: RangeColumnProps) {
  return (
    <td {...rowSpanTags} {...onHoverRange}>
      {formatNumber(value, format)}
    </td>
  );
}

export default memo(RangeColumn);
