import { CSSProperties, memo } from 'react';

import FormatNumber from '../../../utility/FormatNumber';

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
      {FormatNumber(value, format)}
    </td>
  );
}

export default memo(RangeColumn);
