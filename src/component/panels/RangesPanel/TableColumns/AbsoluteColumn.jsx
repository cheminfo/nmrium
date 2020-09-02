import React from 'react';

import FormatNumber from '../../../utility/FormatNumber';

const AbsoluteColumn = ({ rowSpanTags, value, onHoverRange, format }) => {
  return (
    <td {...rowSpanTags} {...onHoverRange}>
      {FormatNumber(value, format)}
    </td>
  );
};

export default AbsoluteColumn;
