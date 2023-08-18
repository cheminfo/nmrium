import lodashGet from 'lodash/get';

import { useDispatch } from '../../../context/DispatchContext';
import EditableColumn from '../../../elements/EditableColumn';
import { formatNumber } from '../../../utility/formatNumber';
import { ZoneData } from '../hooks/useMapZones';

interface SignalDeltaColumnProps {
  rowData: ZoneData;
  onHoverSignalX: any;
  onHoverSignalY: any;
  format: { x: string; y: string };
}

function SignalDeltaColumn({
  rowData,
  onHoverSignalX,
  onHoverSignalY,
  format,
}: SignalDeltaColumnProps) {
  const dispatch = useDispatch();

  const signalDeltaX = lodashGet(rowData, 'tableMetaInfo.signal.x.delta', null);
  const signalDeltaY = lodashGet(rowData, 'tableMetaInfo.signal.y.delta', null);
  const id = lodashGet(rowData, 'tableMetaInfo.signal.id', undefined);

  function saveXHandler(event) {
    const value = Number(event.target.value);
    dispatch({
      type: 'CHANGE_ZONE_SIGNAL_VALUE',
      payload: {
        zoneId: rowData.id,
        signal: { id, deltaX: value },
      },
    });
  }

  function saveYHandler(event) {
    const value = Number(event.target.value);
    dispatch({
      type: 'CHANGE_ZONE_SIGNAL_VALUE',
      payload: {
        zoneId: rowData.id,
        signal: { id, deltaY: value },
      },
    });
  }

  return (
    <>
      <td {...onHoverSignalX}>
        {signalDeltaX !== null ? (
          <EditableColumn
            value={formatNumber(signalDeltaX, format.x)}
            onSave={saveXHandler}
            type="number"
            style={{ padding: '0.1rem 0.4rem' }}
            validate={(val) => val !== ''}
          />
        ) : (
          ''
        )}
      </td>
      <td {...onHoverSignalY}>
        {signalDeltaY !== null ? (
          <EditableColumn
            value={formatNumber(signalDeltaY, format.y)}
            onSave={saveYHandler}
            type="number"
            style={{ padding: '0.1rem 0.4rem' }}
            validate={(val) => val !== ''}
          />
        ) : (
          ''
        )}
      </td>
    </>
  );
}

export default SignalDeltaColumn;
