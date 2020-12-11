import { forwardRef, useCallback, useMemo } from 'react';

import { checkRangeKind } from '../../../../data/utilities/RangeUtilities';
import { useDispatch } from '../../../context/DispatchContext';
import EditableColumn from '../../../elements/EditableColumn';
import { CHANGE_RANGE_RELATIVE } from '../../../reducer/types/Types';
import FormatNumber from '../../../utility/FormatNumber';

const RelativeColumn = forwardRef(
  (
    { rowData, rowSpanTags, onHoverRange, format, onEditStart, editStatus },
    ref,
  ) => {
    const dispatch = useDispatch();
    const integralVal = useMemo(() => {
      const flag = checkRangeKind(rowData);
      const formattedValue = FormatNumber(rowData.integral, format);
      return flag ? formattedValue : `[ ${formattedValue} ]`;
    }, [format, rowData]);

    const saveHandler = useCallback(
      (event) => {
        dispatch({
          type: CHANGE_RANGE_RELATIVE,
          value: event.target.value,
          id: rowData.id,
        });
      },
      [dispatch, rowData.id],
    );

    return (
      <td {...rowSpanTags} {...onHoverRange}>
        <EditableColumn
          ref={ref}
          onEditStart={onEditStart}
          value={integralVal}
          onSave={saveHandler}
          type="number"
          style={{ padding: '0.4rem' }}
          editStatus={editStatus}
        />
      </td>
    );
  },
);

export default RelativeColumn;
