import { memo } from 'react';

import FormatNumber from '../../../utility/FormatNumber';

function RangeColumn({ value, rowSpanTags, onHoverRange, format }) {
  return (
    <td {...rowSpanTags} {...onHoverRange}>
      {FormatNumber(value, format)}
    </td>
  );
}

export default memo(RangeColumn);
