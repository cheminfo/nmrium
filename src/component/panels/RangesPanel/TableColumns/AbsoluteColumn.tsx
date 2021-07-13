import { CSSProperties } from 'react';

import FormatNumber from '../../../utility/FormatNumber';

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
      {FormatNumber(value, format)}
    </td>
  );
}

export default AbsoluteColumn;
