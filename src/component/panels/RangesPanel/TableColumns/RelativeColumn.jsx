import React, { useMemo } from 'react';

import FormatNumber from '../../../utility/FormatNumber';
import { SignalKindsToInclude } from '../../extra/constants/SignalsKinds';
import { checkSignalKinds } from '../../extra/utilities/RangeUtilities';

const RelativeColumn = ({ rowData, rowSpanTags, onHoverRange, format }) => {
  const integralVal = useMemo(() => {
    const flag = checkSignalKinds(rowData, SignalKindsToInclude);
    const formattedValue = FormatNumber(rowData.integral, format);
    return flag ? formattedValue : `[ ${formattedValue} ]`;
  }, [format, rowData]);

  return (
    <td {...rowSpanTags} {...onHoverRange}>
      {integralVal}
    </td>
  );
};

export default RelativeColumn;
