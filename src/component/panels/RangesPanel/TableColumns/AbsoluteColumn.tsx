import { CSSProperties } from 'react';

import { formatNumber } from '../../../utility/formatNumber';

interface AbsoluteColumnProps {
  value: any;
  onHoverRange: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  rowSpanTags: {
    rowSpan: any;
    style: CSSProperties;
  };
  format: string;
}

function AbsoluteColumn({
  rowSpanTags,
  value,
  onHoverRange,
  format,
}: AbsoluteColumnProps) {
  return (
    <td {...rowSpanTags} {...onHoverRange}>
      {formatNumber(value, format)}
    </td>
  );
}

export default AbsoluteColumn;
