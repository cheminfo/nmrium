import React, { memo } from 'react';

import FormatNumber from '../../../utility/FormatNumber';
import { isCloumnVisible } from '../../extra/preferences/ColumnsHelper';

import { initFormat } from './format';

const RangeColumn = memo(({ value, rowSpanTags, onHoverRange, format }) => {
  return (
    <td {...rowSpanTags} {...onHoverRange}>
      {FormatNumber(value, format)}
    </td>
  );
});

export default RangeColumn;
