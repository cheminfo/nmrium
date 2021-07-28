import { useCallback, useMemo } from 'react';

import { checkRangeKind } from '../../../../data/utilities/RangeUtilities';
import { useDispatch } from '../../../context/DispatchContext';
import EditableColumn from '../../../elements/EditableColumn';
import { CHANGE_RANGE_RELATIVE } from '../../../reducer/types/Types';
import FormatNumber from '../../../utility/FormatNumber';

function RelativeColumn({ rowData, rowSpanTags, onHoverRange, format }) {
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
        payload: {
          data: { value: event.target.value, id: rowData.id },
        },
      });
    },
    [dispatch, rowData.id],
  );

  return (
    <td {...rowSpanTags} {...onHoverRange}>
      <EditableColumn
        value={integralVal}
        onSave={saveHandler}
        type="number"
        style={{ padding: '0.1rem 0.4rem' }}
      />
    </td>
  );
}

export default RelativeColumn;
