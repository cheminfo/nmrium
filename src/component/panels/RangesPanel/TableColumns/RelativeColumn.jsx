import React, { useMemo } from 'react';

import FormatNumber from '../../../utility/FormatNumber';
import { checkSignalKinds } from '../../extra/utilities/RangeUtilities';

const RelativeColumn = ({
  rowData,
  rowSpanTags,
  onHoverRange,
  SignalKindsToConsiderInIntegralsSum,
  format,
}) => {
  const integralVal = useMemo(() => {
    const flag = checkSignalKinds(rowData, SignalKindsToConsiderInIntegralsSum);
    const formatedValue = FormatNumber(rowData.integral, format);
    return flag ? formatedValue : `[ ${formatedValue} ]`;
  }, [SignalKindsToConsiderInIntegralsSum, format, rowData]);

  return (
    <td {...rowSpanTags} {...onHoverRange}>
      {integralVal}
    </td>
  );
};

export default RelativeColumn;
