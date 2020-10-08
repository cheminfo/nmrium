import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch } from '../../../context/DispatchContext';

import Input from '../../../elements/Input';
import { CHANGE_RANGE_RELATIVE } from '../../../reducer/types/Types';
import FormatNumber from '../../../utility/FormatNumber';
import { checkSignalKinds } from '../../extra/utilities/RangeUtilities';

const RelativeColumn = ({
  rowData,
  rowSpanTags,
  onHoverRange,
  SignalKindsToConsiderInIntegralsSum,
  format,
}) => {
  const dispatch = useDispatch();
  const [enabled, enableEdit] = useState(false);
  const integralVal = useMemo(() => {
    const flag = checkSignalKinds(rowData, SignalKindsToConsiderInIntegralsSum);
    const formatedValue = FormatNumber(rowData.integral, format);
    return flag ? formatedValue : `[ ${formatedValue} ]`;
  }, [SignalKindsToConsiderInIntegralsSum, format, rowData]);

  const editModeHandler = useCallback(
    (flag, event = null) => {
      if (event && flag === false) {
        if (event.keyCode === 13) {
          // when press Enter
          dispatch({
            type: CHANGE_RANGE_RELATIVE,
            value: event.target.value,
            id: rowData.id,
          });
          enableEdit(flag);
        } else if (event.keyCode === 27) {
          // when press Escape
          enableEdit(flag);
        }
      } else {
        enableEdit(flag);
      }
    },
    [dispatch, rowData.id],
  );

  return (
    <td
      {...rowSpanTags}
      {...onHoverRange}
      onDoubleClick={() => editModeHandler(true)}
    >
      {!enabled && integralVal}
      {enabled && (
        <Input
          value={integralVal}
          type="number"
          onKeyDown={(e) => editModeHandler(false, e)}
        />
      )}
    </td>
  );
};

export default RelativeColumn;
