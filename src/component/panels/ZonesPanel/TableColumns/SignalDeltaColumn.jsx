import lodash from 'lodash';
import { Fragment, useCallback } from 'react';

import { useDispatch } from '../../../context/DispatchContext';
import EditableColumn from '../../../elements/EditableColumn';
import { CHANGE_ZONE_SIGNAL } from '../../../reducer/types/Types';

const SignalDeltaColumn = ({ rowData, onHoverSignalX, onHoverSignalY }) => {
  const dispatch = useDispatch();

  const signalDeltaX = lodash.get(
    rowData,
    'tableMetaInfo.signal.x.delta',
    undefined,
  );
  const signalDeltaY = lodash.get(
    rowData,
    'tableMetaInfo.signal.y.delta',
    undefined,
  );
  const id = lodash.get(rowData, 'tableMetaInfo.signal.id', undefined);

  const saveXHandler = useCallback(
    (event) => {
      const value = event.target.value;
      dispatch({
        type: CHANGE_ZONE_SIGNAL,
        payload: {
          zoneID: rowData.id,
          signal: { id, x: value },
        },
      });
    },
    [dispatch, id, rowData.id],
  );
  const saveYHandler = useCallback(
    (event) => {
      const value = event.target.value;
      dispatch({
        type: CHANGE_ZONE_SIGNAL,
        payload: {
          zoneID: rowData.id,
          signal: { id, y: value },
        },
      });
    },
    [dispatch, id, rowData.id],
  );

  return (
    <Fragment>
      <td {...onHoverSignalX}>
        {signalDeltaX ? (
          <EditableColumn
            // onEditStart={editStartHandler}
            value={signalDeltaX.toFixed(2)}
            onSave={saveXHandler}
            type="number"
            style={{ padding: '0.4rem' }}
            // editStatus={editStatus}
          />
        ) : (
          ''
        )}
      </td>
      <td {...onHoverSignalY}>
        {signalDeltaY ? (
          <EditableColumn
            // onEditStart={editStartHandler}
            value={signalDeltaY.toFixed(2)}
            onSave={saveYHandler}
            type="number"
            style={{ padding: '0.4rem' }}
            // editStatus={editStatus}
          />
        ) : (
          ''
        )}
      </td>
    </Fragment>
  );
};

export default SignalDeltaColumn;
